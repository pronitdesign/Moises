import { useEffect, useRef } from 'react';
import type { ScrubState } from '../hooks/useScrollVideo';
import { clamp, easeInOutSine } from '../lib/math';

interface Props {
  subscribe: (cb: (state: ScrubState) => void) => () => void;
  reduced: boolean;
}

export function Hero({ subscribe, reduced }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let wasLive = -1;

    return subscribe(({ progress }) => {
      const t = easeInOutSine(clamp(progress / 0.07));
      const live = t < 0.999 ? 1 : 0;
      if (live !== wasLive) {
        el.style.visibility = live ? 'visible' : 'hidden';
        wasLive = live;
      }
      if (!live) return;

      el.style.opacity = (1 - t).toFixed(3);
      el.style.transform = `translate3d(0, ${(-64 * t).toFixed(2)}px, 0)`;
      if (!reduced) el.style.filter = t > 0.004 ? `blur(${(t * 14).toFixed(2)}px)` : 'none';
    });
  }, [subscribe, reduced]);

  return (
    <div className="hero">
      <div ref={ref} className="hero__type">
        <p className="hero__eyebrow">
          <span className="hero__eyebrow-rule" aria-hidden="true" />
          Episode 04
        </p>

        <h1 className="hero__title">
          <span>Moses</span>
          <span>parts the</span>
          <span>Red Sea</span>
        </h1>

        <p className="hero__quote">
          When the sea stood as a wall,
          <br />a path appeared where none existed.
        </p>

        <dl className="hero__meta">
          <div>
            <dt>Source</dt>
            <dd>Exodus 14</dd>
          </div>
          <div>
            <dt>Period</dt>
            <dd>c. 13th century BC</dd>
          </div>
          <div>
            <dt>Place</dt>
            <dd>Sinai</dd>
          </div>
        </dl>
      </div>

      <p className="hero__spine" aria-hidden="true">
        A journey through Exodus
      </p>
    </div>
  );
}
