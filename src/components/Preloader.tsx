import { useEffect, useRef, useState } from 'react';

interface Props {
  progress: number;
  ready: boolean;
}

export function Preloader({ progress, ready }: Props) {
  const [gone, setGone] = useState(false);
  const barRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
    if (pctRef.current) pctRef.current.textContent = String(Math.round(progress * 100)).padStart(3, '0');
  }, [progress]);

  useEffect(() => {
    if (!ready) return;

    // Releasing the scroll lock is the moment Chrome reapplies the position it
    // remembered from the previous visit, and it can land a frame or two after
    // the release. Hold the episode on its first frame across the reveal, but
    // yield immediately if the viewer actually starts scrolling.
    document.body.dataset.loaded = 'true';
    window.scrollTo(0, 0);

    let raf = 0;
    let holding = true;
    const until = performance.now() + 500;
    const release = () => {
      holding = false;
    };

    const hold = () => {
      if (!holding) return;
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      if (performance.now() < until) raf = requestAnimationFrame(hold);
    };
    raf = requestAnimationFrame(hold);

    const opts = { once: true, passive: true } as const;
    window.addEventListener('wheel', release, opts);
    window.addEventListener('touchstart', release, opts);
    window.addEventListener('keydown', release, opts);

    const t = window.setTimeout(() => setGone(true), 1100);
    return () => {
      holding = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchstart', release);
      window.removeEventListener('keydown', release);
    };
  }, [ready]);

  if (gone) return null;

  return (
    <div className="preloader" data-ready={ready || undefined}>
      <div className="preloader__inner">
        <p className="preloader__mark">The Book</p>
        <p className="preloader__title">
          Episode 04 <span>&#8212;</span> Moses parts the Red Sea
        </p>
        <div className="preloader__bar">
          <span ref={barRef} className="preloader__fill" />
        </div>
        <p className="preloader__pct">
          <span ref={pctRef}>000</span>
          <span className="preloader__pct-unit">%</span>
        </p>
        <p className="preloader__note">Loading the film in full, so the scrub never waits on the network.</p>
      </div>
    </div>
  );
}
