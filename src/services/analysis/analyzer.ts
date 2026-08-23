// 分析引擎：手动分析闭环 + 自动循环状态机 + 自动/手动打招呼模式
// 引擎保持命令式（原版逻辑逐行对照迁移），所有 UI 变化通过 emit 事件抛出，由 React 侧 reducer 消费

import { LOOP_CONFIG } from "~src/constant/loop"
import type {
  AnalysisPhase,
  GreetingMode,
  JobCardInfo,
  JobDetailInfo,
  LlmChatMessage,
  LlmParseResult,
  LoopStatus
} from "~src/constant/types"
import { ZHIPIN_SELECTORS } from "~src/constant/zhipin-selectors"
import { createLlmClient } from "~src/services/llm"
import type { LlmClient } from "~src/services/llm/types"
import { getAppConfig } from "~src/services/storage"
import {
  clickCard,
  currentCart,
  extractCardInfo,
  extractDetailInfo,
  findActiveCardIndex,
  findCurrentCard,
  scrollToBottom,
  waitForDetail
} from "~src/services/zhipin/scraper"
import { getErrorMessage } from "~src/utils/error-message"
import { parseLlmResponse } from "~src/utils/parse-llm"
import { buildPrompt } from "~src/utils/prompt"

/** 分析事件：引擎 → UI 的所有状态变更（与 UI reducer 的 action 形状一致，可直接 dispatch） */
export type AnalyzerEvent =
  | { type: "setStatus"; text: string; isError?: boolean }
  | { type: "setJob"; job: JobCardInfo; detail: JobDetailInfo }
  | {
      type: "setResult"
      result: LlmParseResult
      rawText: string
      /** 输入 token 数（API 未返回时为 undefined） */
      promptTokens?: number
      /** 输出 token 数（API 未返回时为 undefined） */
      completionTokens?: number
    }
  | { type: "resetResult" }
  | {
      type: "setLoopStatus"
      status: LoopStatus
      text: string
      isError?: boolean
    }
  | { type: "setPhase"; phase: AnalysisPhase }
  | { type: "setPrompt"; prompt: string }

/** 分析模式：手动逐个分析（analyzeOnce）/ 自动循环分析（runLoop） */
type AnalysisMode = "auto" | "manual"

/** 循环运行时状态（引擎内部，页面刷新即重置） */
interface LoopState {
  /** 状态机状态 */
  status: LoopStatus
  /** 已分析岗位 href 集合（去重） */
  doneSet: Set<string>
  /** 当前分析索引 */
  currentIndex: number
}

/** 分析引擎接口 */
export interface Analyzer {
  /** 手动分析当前岗位（抛错由调用方处理） */
  analyzeOnce(): Promise<LlmParseResult>
  /** 开始自动循环分析 */
  start(): void
  /** 匹配暂停后继续分析 */
  resume(): void
  /** 匹配后打招呼并继续分析下一个岗位（MATCHED 暂停 / 手动分析匹配后均可） */
  greetAndContinue(): Promise<void>
  /** 手动分析不匹配后继续分析下一个岗位 */
  analyzeNext(): Promise<void>
  /** 停止自动循环 */
  stop(): void
}

/**
 * 创建分析引擎
 * @param emit 事件回调（React 侧直接 dispatch 到 reducer）
 * @returns 分析引擎实例
 */
export function createAnalyzer(emit: (event: AnalyzerEvent) => void): Analyzer {
  /** 循环运行时状态 */
  const loop: LoopState = {
    status: "IDLE",
    doneSet: new Set(),
    currentIndex: 0
  }
  /** LLM 客户端缓存（开始分析时按配置创建，循环期间不重读 storage） */
  let llmClient: LlmClient | null = null
  /** 简历文本缓存（开始分析时快照） */
  let resumeCache = ""
  /** 打招呼模式缓存（开始分析时快照） */
  let greetingMode: GreetingMode = "auto"
  /** 当前分析模式（analyzeOnce 置手动、start 置自动；「分析下一个」时保持模式不变） */
  let analysisMode: AnalysisMode = "manual"

  /** 延时（防风控间隔） */
  function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms))
  }

  /**
   * 轮询等待元素出现（动态渲染场景，如打招呼确认弹窗）
   * @param selector 选择器
   * @param timeoutMs 超时
   * @returns 匹配元素；超时返回 null
   */
  function waitForElement(
    selector: string,
    timeoutMs: number
  ): Promise<HTMLElement | null> {
    return new Promise((resolve) => {
      const start = Date.now()
      const tick = () => {
        const el = document.querySelector<HTMLElement>(selector)
        if (el) {
          resolve(el)
          return
        }
        if (Date.now() - start > timeoutMs) {
          resolve(null)
          return
        }
        setTimeout(tick, LOOP_CONFIG.greetDialogIntervalMs)
      }
      tick()
    })
  }

  /**
   * 初始化引擎运行时缓存：校验配置后创建 LLM 客户端，并快照简历/打招呼模式
   * @returns 是否初始化成功（模型或简历缺失返回 false，错误已 emit 到状态条）
   */
  async function initRuntime(): Promise<boolean> {
    const config = await getAppConfig()
    if (!config.model) {
      emit({
        type: "setStatus",
        text: "请先在 popup 中选择模型",
        isError: true
      })
      return false
    }
    if (!config.resumeText) {
      emit({
        type: "setStatus",
        text: "请先在 popup 中粘贴并保存简历",
        isError: true
      })
      return false
    }
    llmClient = createLlmClient(config)
    resumeCache = config.resumeText
    greetingMode = config.greetingMode
    return true
  }

  // ── 抓取与 LLM 分析（手动 / 自动循环共用核心）──

  /**
   * 加载指定卡片详情：滚动定位 + 点击触发右侧详情加载 + 防竞态等待 + 提取并 emit
   * 详情加载超时会 reject（循环侧 catch 后跳过该岗位，手动侧抛给调用方统一提示）
   * @param info 卡片信息（已提取，供等待匹配与 setJob/prompt 使用）
   * @param card 卡片元素
   * @returns 详情信息
   */
  async function grabJobInfo(
    info: JobCardInfo,
    card: Element
  ): Promise<JobDetailInfo> {
    card.scrollIntoView({ block: "center" })
    clickCard(card)
    await waitForDetail(info.title)
    const detail = extractDetailInfo()
    emit({ type: "setJob", job: info, detail })
    return detail
  }

  /**
   * 构建 prompt 并调用 LLM 分析，emit 分析结果事件（手动 / 自动循环复用）
   * @param role LLM 消息角色（手动分析用 user，自动循环用 system，保持原有行为）
   * @returns 解析后的 LLM 结果
   */
  async function analyzeWithLlm(
    info: JobCardInfo,
    detail: JobDetailInfo,
    role: LlmChatMessage["role"]
  ): Promise<LlmParseResult> {
    emit({ type: "setPhase", phase: "analyzing" })
    const prompt = buildPrompt(resumeCache, {
      ...info,
      description: detail.description
    })
    emit({ type: "setPrompt", prompt })
    if (!llmClient) throw new Error("LLM 客户端未初始化")
    const llmResult = await llmClient.chat([{ role, content: prompt }])
    const result = parseLlmResponse(llmResult.text)
    emit({
      type: "setResult",
      result,
      rawText: llmResult.text,
      promptTokens: llmResult.promptTokens,
      completionTokens: llmResult.completionTokens
    })
    emit({ type: "setPhase", phase: "done" })
    return result
  }

  /** 抓取并分析指定卡片（手动分析 / 分析下一个 / 自动循环 共用的单次分析闭环） */
  async function analyzeCard(
    card: Element,
    role: LlmChatMessage["role"]
  ): Promise<LlmParseResult> {
    emit({ type: "resetResult" })
    emit({ type: "setPhase", phase: "grabbing" })
    emit({ type: "setStatus", text: "抓取中…" })
    const info = extractCardInfo(card)
    const detail = await grabJobInfo(info, card)
    emit({ type: "setStatus", text: "AI 分析中…" })
    const result = await analyzeWithLlm(info, detail, role)
    emit({ type: "setStatus", text: "分析完成" })
    return result
  }

  /**
   * 手动分析当前岗位
   * - 校验：模型未选 / 简历为空 / 未找到卡片 / 详情超时 / LLM 调用失败均抛错（由调用方提示）
   */
  async function analyzeOnce(): Promise<LlmParseResult> {
    analysisMode = "manual"
    // 校验配置并初始化运行时缓存（llmClient / resumeCache），失败原因已 emit 到状态条
    await initRuntime()
    const card = findCurrentCard()
    if (!card) throw new Error("未找到岗位卡片")
    return analyzeCard(card, "user")
  }

  /**
   * 手动模式：单次分析指定索引的卡片（「分析下一个」用），失败在引擎内提示
   * @param index 卡片索引
   * @returns 是否成功定位到卡片并开始分析
   */
  async function analyzeCardAt(index: number): Promise<boolean> {
    const card = currentCart(index)
    if (!card) {
      emit({
        type: "setStatus",
        text: "已到列表末尾，没有下一个岗位",
        isError: true
      })
      return false
    }
    card.scrollIntoView({ block: "center" })
    try {
      await analyzeCard(card, "user")
    } catch (err) {
      // 分析失败：重置阶段，避免步骤条停留在抓取/分析的 loading 态
      emit({ type: "setPhase", phase: "idle" })
      emit({
        type: "setStatus",
        text: `分析失败：${getErrorMessage(err)}`,
        isError: true
      })
    }
    return true
  }

  // ── 打招呼 ──

  /**
   * 自动打招呼闭环：点「立即沟通」→ 轮询等待确认弹窗出现（动态渲染）→ 点「留在此页」关闭
   * @returns 是否完整走完（按钮缺失或弹窗超时返回 false）
   */
  async function sendGreeting(): Promise<boolean> {
    const btn = document.querySelector<HTMLElement>(
      ZHIPIN_SELECTORS.greetButton
    )
    if (!btn) return false
    btn.click()
    // 弹窗为点击后动态渲染，必须轮询等待，立即查找会找不到
    const dialog = await waitForElement(
      ZHIPIN_SELECTORS.greetDialog,
      LOOP_CONFIG.greetDialogTimeoutMs
    )
    if (!dialog) return false
    document
      .querySelector<HTMLElement>(ZHIPIN_SELECTORS.greetDialogStay)
      ?.click()
    return true
  }

  /** 暂停循环为 MATCHED（匹配等待操作 / 打招呼失败降级），等待用户手动处理后点「继续分析」 */
  function pauseAsMatched(text: string, isError = false): void {
    loop.status = "MATCHED"
    emit({ type: "setLoopStatus", status: "MATCHED", text, isError })
  }

  /**
   * 自动模式匹配后打招呼：发送成功返回 true；失败降级为 MATCHED 暂停，避免漏发
   * @returns 是否发送成功
   */
  async function greetAutomatically(): Promise<boolean> {
    emit({ type: "setStatus", text: "匹配！自动打招呼中…" })
    const greeted = await sendGreeting()
    if (!greeted) {
      pauseAsMatched("自动打招呼失败，请手动发送后点继续", true)
      return false
    }
    return true
  }

  // ── 自动循环 ──

  /** 启动自动循环（start / resume / 匹配后继续 复用）：设置起始索引并进入 RUNNING */
  function startLoop(startIndex: number, text: string): void {
    loop.currentIndex = startIndex
    loop.status = "RUNNING"
    emit({ type: "setLoopStatus", status: "RUNNING", text })
    void runLoop()
  }

  /** 自动循环主体：顺序分析 → 去重 → 懒加载重试 → 延时 → 匹配分支（自动打招呼/暂停） */
  async function runLoop(): Promise<void> {
    try {
      while (loop.status === "RUNNING") {
        emit({ type: "resetResult" })
        const card = currentCart(loop.currentIndex)
        if (!card) {
          // 列表到底：滚动页面本身触发懒加载，等待后重试一次
          scrollToBottom()
          await sleep(LOOP_CONFIG.lazyLoadRetryDelayMs)
          const retry = currentCart(loop.currentIndex)
          if (!retry) {
            loop.status = "DONE"
            emit({
              type: "setLoopStatus",
              status: "DONE",
              text: "列表已全部分析完成"
            })
            return
          }
          continue
        }
        const info = extractCardInfo(card)
        if (loop.doneSet.has(info.href)) {
          loop.currentIndex++
          continue
        }

        emit({ type: "setPhase", phase: "grabbing" })
        emit({ type: "setStatus", text: `分析中（${loop.currentIndex + 1}）…` })
        // 抓取详情；失败（详情加载超时）则跳过该岗位继续
        const detail = await grabJobInfo(info, card).catch(() => null)
        if (!detail) {
          emit({
            type: "setStatus",
            text: `已跳过：${info.title}（详情加载超时）`,
            isError: true
          })
          loop.doneSet.add(info.href)
          loop.currentIndex++
          await sleep(LOOP_CONFIG.delayMs)
          continue
        }
        const result = await analyzeWithLlm(info, detail, "system")
        loop.doneSet.add(info.href)
        loop.currentIndex++

        // AI 返回无法解析：停止循环等待人工处理
        if (!result.ok) {
          loop.status = "IDLE"
          emit({
            type: "setLoopStatus",
            status: "IDLE",
            text: `分析失败：${result.reason}`,
            isError: true
          })
          return
        }

        if (result.match) {
          if (greetingMode === "auto") {
            // 自动模式：发送打招呼后继续下一个岗位（发送失败已在内部降级 MATCHED）
            if (!(await greetAutomatically())) return
            emit({ type: "setStatus", text: "已自动打招呼，继续分析…" })
            await sleep(LOOP_CONFIG.delayMs)
            continue
          }
          // 手动模式：暂停等待用户复制打招呼语后点「继续分析」
          pauseAsMatched("匹配到合适岗位，等待你的操作")
          return
        }

        await sleep(LOOP_CONFIG.delayMs)
      }
    } catch (err) {
      loop.status = "IDLE"
      emit({ type: "setPhase", phase: "idle" })
      emit({
        type: "setLoopStatus",
        status: "IDLE",
        text: `分析中断：${getErrorMessage(err)}`,
        isError: true
      })
    }
  }

  /** 开始自动循环：校验配置并缓存快照 → 从当前选中卡片开始 RUNNING */
  async function start(): Promise<void> {
    if (!(await initRuntime())) return
    analysisMode = "auto"
    loop.doneSet.clear()
    startLoop(findActiveCardIndex(), "开始分析…")
  }

  /** 匹配暂停后继续分析（从暂停时位置继续，loop.currentIndex 已指向下一个岗位） */
  function resume(): void {
    if (loop.status !== "MATCHED") return
    startLoop(loop.currentIndex, "继续分析…")
  }

  // ── 匹配后 / 不匹配后继续下一个岗位 ──

  /**
   * 手动场景继续分析下一个岗位（greetAndContinue / analyzeNext 复用）
   * - MATCHED（自动循环手动模式暂停）：resume 继续，loop.currentIndex 已指向下一个岗位
   * - 引擎自动分析中（RUNNING）：自动模式匹配后已自动发招呼继续，无需干预
   * - 其余：按当前分析模式继续（自动保持循环 / 手动单次分析，模式不变）
   * @param needGreet 是否需要在自动模式下先自动打招呼（匹配后为 true，不匹配为 false）
   */
  async function continueNext(needGreet: boolean): Promise<void> {
    if (loop.status === "MATCHED") {
      resume()
      return
    }
    if (loop.status === "RUNNING") return
    if (!(await initRuntime())) return
    if (needGreet && greetingMode === "auto") {
      if (!(await greetAutomatically())) return
    }
    if (analysisMode === "auto") {
      // 自动分析模式：从当前岗位的下一个位置继续自动循环
      startLoop(findActiveCardIndex() + 1, "继续分析…")
      return
    }
    // 手动分析模式：单次分析下一个岗位后停下，模式不变
    await analyzeCardAt(findActiveCardIndex() + 1)
  }

  /** 停止自动循环（runLoop 的 while 检查到状态变化后自然退出） */
  function stop(): void {
    loop.status = "IDLE"
    emit({ type: "setPhase", phase: "idle" })
    emit({ type: "setLoopStatus", status: "IDLE", text: "已停止" })
  }

  return {
    analyzeOnce,
    start,
    resume,
    greetAndContinue: () => continueNext(true),
    analyzeNext: () => continueNext(false),
    stop
  }
}
