import { EpisodeOutro } from './components/EpisodeOutro';
import { Header } from './components/Header';
import { Preloader } from './components/Preloader';
import { ScrollVideo } from './components/ScrollVideo';
import { FILM_FPS } from './data/storyBeats';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useScrollVideo } from './hooks/useScrollVideo';

/** Scroll travel the film is stretched across, past the first viewport.
 *  700vh over 362 frames is ~17px of scroll per frame: fine enough that no
 *  frame can be skipped by an ordinary wheel gesture. */
const SCROLL_VH = 700;

export default function App() {
  const isPortrait = useMediaQuery('(max-width: 680px)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  const src = isPortrait ? '/media/moses-mobile.mp4' : '/media/moses-desktop.mp4';
  const poster = isPortrait ? '/media/poster-mobile.jpg' : '/media/poster-desktop.jpg';

  const { sectionRef, videoRef, ready, loadProgress, subscribe } = useScrollVideo({
    src,
    fps: FILM_FPS,
  });

  return (
    <>
      <Preloader progress={loadProgress} ready={ready} />
      <Header />
      <main>
        <ScrollVideo
          sectionRef={sectionRef}
          videoRef={videoRef}
          subscribe={subscribe}
          poster={poster}
          reduced={reduced}
          scrollVh={SCROLL_VH}
        />
        <EpisodeOutro />
      </main>
    </>
  );
}
