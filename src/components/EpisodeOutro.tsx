import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function EpisodeOutro() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 34,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="outro" id="episodes">
      <div className="outro__statement">
        <h2 className="outro__headline" data-reveal>
          <span>The sea</span>
          <span>became</span>
          <span>a road.</span>
        </h2>

        <figure className="outro__quote" data-reveal>
          <blockquote>
            The Israelites went through the sea on dry ground, with a wall of water on their right
            and on their left.
          </blockquote>
          <figcaption>Exodus 14:29</figcaption>
        </figure>
      </div>

      <hr className="outro__rule" />

      <a className="next" href="#next" data-reveal>
        <div className="next__copy">
          <p className="next__kicker">Next episode</p>
          <h3 className="next__title">The Wilderness</h3>
          <p className="next__body">
            Forty years of sand, manna and silence. The people are free — and now they have to
            learn what freedom costs.
          </p>
          <span className="next__cta">
            Explore Episode 05
            <span className="next__arrow" aria-hidden="true">
              &#8594;
            </span>
          </span>
        </div>

        <div className="next__still">
          <img src="/media/next-episode.jpg" alt="" loading="lazy" decoding="async" />
          <span className="next__still-tag">Ep. 05</span>
        </div>
      </a>

      <footer className="foot">
        <span>The Book — An interactive biblical archive</span>
        <span className="foot__mid" id="about">
          Exodus 14 · Ep. 04
        </span>
        <span id="timeline">2026</span>
      </footer>
    </section>
  );
}
