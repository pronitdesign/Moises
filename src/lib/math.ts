export const clamp = (v: number, min = 0, max = 1) =>
  v < min ? min : v > max ? max : v;

/** Normalised position of `v` inside [a, b], clamped to 0..1. */
export const norm = (v: number, a: number, b: number) =>
  b === a ? 0 : clamp((v - a) / (b - a));

/** Smooth, symmetrical ease. Zero velocity at both ends. */
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** Decelerating ease — used for card entrances. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Frame-rate independent exponential damping.
 * `tau` is the time constant in seconds: roughly how long it takes to
 * cover ~63% of the remaining distance.
 */
export const damp = (current: number, target: number, tau: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-dt / tau));

/** mm:ss from seconds. */
export const timecode = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
