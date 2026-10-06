import { useEffect, useRef } from 'react';
import type { StoryBeat } from '../data/storyBeats';
import type { ScrubState } from '../hooks/useScrollVideo';
import { easeInOutSine, easeOutCubic, norm } from '../lib/math';

/** Length of the enter/exit ramp, in units of global timeline progress.
 *  At 700vh of scroll this is roughly 250px of travel — slow enough to read
 *  as a dissolve rather than a toggle. */
const RAMP = 0.035;

interface Props {
  beat: StoryBeat;
  subscribe: (cb: (state: ScrubState) => void) => () => void;
  reduced: boolean;
}

export function StoryCard({ beat, subscribe, reduced }: Props) {
  const ref = useRef<HTMLElement>(null);
  const Icon = beat.icon;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let wasLive = -1;

    return subscribe(({ progress: p }) => {
      const tIn = norm(p, beat.start, beat.start + RAMP);
      const tOut = norm(p, beat.end - RAMP, beat.end);
      const eIn = easeOutCubic(tIn);
      const eOut = easeInOutSine(tOut);
      const presence = eIn * (1 - eOut);

      // Park the card completely when it is off the timeline — a hidden card
      // costs nothing, and backdrop-filter is the most expensive thing here.
      const live = presence > 0.002 ? 1 : 0;
      if (live !== wasLive) {
        el.style.visibility = live ? 'visible' : 'hidden';
        wasLive = live;
      }
      if (!live) return;

      const travel = reduced ? 0.35 : 1;
      const y = ((1 - eIn) * 40 + eOut * -30) * travel;
      const scale = 0.96 + 0.04 * eIn - 0.015 * eOut;

      el.style.opacity = presence.toFixed(3);
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;

      if (!reduced) {
        const blur = (1 - eIn) * 10 + eOut * 8;
        // Drop the filter entirely once it is imperceptible, so the resting
        // state of the card is a plain composited layer.
        el.style.filter = blur > 0.06 ? `blur(${blur.toFixed(2)}px)` : 'none';
      }
    });
  }, [beat, subscribe, reduced]);

  return (
    <div className="card-slot" data-side={beat.side} aria-hidden="true">
      <article ref={ref} className="card">
        <div className="card__head">
          <span className="card__icon">
            <Icon width={20} height={20} />
          </span>
          <span className="card__index">{beat.index}</span>
        </div>

        <p className="card__eyebrow">{beat.eyebrow}</p>
        <h2 className="card__title">{beat.title}</h2>
        <p className="card__body">{beat.description}</p>

        <ul className="card__tags">
          {beat.tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
