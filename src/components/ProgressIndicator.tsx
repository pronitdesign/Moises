import { useEffect, useRef } from 'react';
import { storyBeats } from '../data/storyBeats';
import type { ScrubState } from '../hooks/useScrollVideo';
import { clamp, timecode } from '../lib/math';

interface Props {
  subscribe: (cb: (state: ScrubState) => void) => () => void;
}

export function ProgressIndicator({ subscribe }: Props) {
  const fillRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const elapsedRef = useRef<HTMLSpanElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    const rail = railRef.current;
    const elapsed = elapsedRef.current;
    const total = totalRef.current;
    if (!fill || !rail || !elapsed || !total) return;

    const stops = Array.from(rail.querySelectorAll<HTMLLIElement>('[data-stop]'));
    let lastActive = -1;
    let lastTc = '';
    let lastTotal = '';

    return subscribe((state) => {
      fill.style.transform = `scaleY(${clamp(state.progress).toFixed(4)})`;

      // The active beat is the last one the timeline has reached.
      let active = -1;
      for (let i = 0; i < storyBeats.length; i += 1) {
        if (state.progress >= storyBeats[i].start - 0.04) active = i;
      }
      if (active !== lastActive) {
        stops.forEach((stop, i) => {
          stop.dataset.state = i < active ? 'past' : i === active ? 'active' : 'ahead';
        });
        lastActive = active;
      }

      const tc = timecode(state.time);
      if (tc !== lastTc) {
        elapsed.textContent = tc;
        lastTc = tc;
      }
      const dur = timecode(state.duration);
      if (dur !== lastTotal) {
        total.textContent = dur;
        lastTotal = dur;
      }
    });
  }, [subscribe]);

  return (
    <>
      <nav className="rail" aria-label="Episode progress">
        <span className="rail__track" aria-hidden="true">
          <span ref={fillRef} className="rail__fill" />
        </span>
        <ol ref={railRef} className="rail__stops">
          {storyBeats.map((beat) => (
            <li key={beat.id} data-stop data-state="ahead" className="rail__stop">
              <span className="rail__num">{beat.index}</span>
              <span className="rail__label">{beat.marker}</span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="readout">
        <span ref={elapsedRef}>00:00</span>
        <span className="readout__sep">/</span>
        <span ref={totalRef} className="readout__total">
          00:15
        </span>
      </div>
    </>
  );
}
