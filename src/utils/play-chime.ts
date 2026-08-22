// 匹配提示音：Web Audio API 合成短促双音（无需音频文件）
// 注意：部分浏览器要求用户交互后 AudioContext 才能出声；失败时静默忽略

/** 提示音音符频率序列（E5 → A5 上行双音） */
const CHIME_NOTES = [659.25, 880];

/**
 * 播放匹配提示音（无 AudioContext 或浏览器拦截时静默失败）
 */
export function playMatchChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    CHIME_NOTES.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startAt = ctx.currentTime + i * 0.18;
      // 包络：快速起音 → 指数衰减，避免爆音
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.25, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + 0.2);
    });

    setTimeout(() => void ctx.close(), 800);
  } catch {
    // 音频被拦截或环境不支持：静默忽略
  }
}
