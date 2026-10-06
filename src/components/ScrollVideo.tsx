import type { RefObject } from 'react';
import { storyBeats } from '../data/storyBeats';
import type { ScrubState } from '../hooks/useScrollVideo';
import { Hero } from './Hero';
import { ProgressIndicator } from './ProgressIndicator';
import { StoryCard } from './StoryCard';

interface Props {
  sectionRef: RefObject<HTMLDivElement>;
  videoRef: RefObject<HTMLVideoElement>;
  subscribe: (cb: (state: ScrubState) => void) => () => void;
  poster: string;
  reduced: boolean;
  /** Scroll travel past the first viewport, in viewport heights. */
  scrollVh: number;
}

export function ScrollVideo({
  sectionRef,
  videoRef,
  subscribe,
  poster,
  reduced,
  scrollVh,
}: Props) {
  return (
    <section
      ref={sectionRef}
      className="stage"
      id="top"
      style={{ ['--stage-scroll' as string]: scrollVh }}
    >
      <div className="stage__sticky">
        <video
          ref={videoRef}
          className="stage__film"
          poster={poster}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          aria-hidden="true"
        />

        <div className="scrim scrim--bottom" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />

        <div className="stage__ui">
          <Hero subscribe={subscribe} reduced={reduced} />

          <div className="cards">
            {storyBeats.map((beat) => (
              <StoryCard key={beat.id} beat={beat} subscribe={subscribe} reduced={reduced} />
            ))}
          </div>

          <ProgressIndicator subscribe={subscribe} />

          <p className="stage__slug">
            Ep 04 <span aria-hidden="true">/</span> Exodus
          </p>
        </div>
      </div>

      {/* Spoken description of the sequence, for screen readers and for anyone
          who cannot use a scroll-driven interface. */}
      <p className="sr-only">
        A scroll-controlled film of the crossing of the Red Sea. Moses stands before the water,
        raises his staff, an east wind drives the sea apart, and the people of Israel cross on dry
        ground between two walls of water.
      </p>
    </section>
  );
}
