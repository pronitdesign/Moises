import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp, damp } from '../lib/math';

gsap.registerPlugin(ScrollTrigger);

/** How quickly the film catches up to the scrollbar, in seconds.
 *  Low enough to feel wired to the wheel, high enough to erase the
 *  coarse quantisation of raw scroll events. */
const TAU = 0.11;

/** Abandon a seek that never reported back, rather than dead-locking. */
const SEEK_TIMEOUT_MS = 240;

export interface ScrubState {
  /** Undamped scroll progress, 0..1 */
  raw: number;
  /** Damped scroll progress, 0..1 — the timeline everything reads from */
  progress: number;
  /** Seconds into the film */
  time: number;
  duration: number;
}

type Listener = (state: ScrubState) => void;

interface Options {
  src: string;
  /** Frame rate of the source file. Used to quantise seeks onto the frame grid. */
  fps: number;
}

const once = (el: HTMLElement, event: string, timeout = 1500) =>
  new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener(event, finish);
      resolve();
    };
    el.addEventListener(event, finish, { once: true });
    window.setTimeout(finish, timeout);
  });

export function useScrollVideo({ src, fps }: Options) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const rawRef = useRef(0);
  const stateRef = useRef<ScrubState>({ raw: 0, progress: 0, time: 0, duration: 0 });
  const listeners = useRef(new Set<Listener>());

  /** Register a per-frame callback. Consumers write straight to the DOM from
   *  here, so scrubbing never triggers a React render. */
  const subscribe = useCallback((cb: Listener) => {
    listeners.current.add(cb);
    cb(stateRef.current);
    return () => {
      listeners.current.delete(cb);
    };
  }, []);

  /* ---------------------------------------------------------------- *
   * 1. Load the whole file into memory before enabling the scrubber.
   *    Streaming a scrubbed video means every seek can hit the network;
   *    a blob guarantees every frame is one memcpy away.
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    setReady(false);
    setLoadProgress(0);

    const streamFallback = () => {
      if (cancelled) return;
      video.src = src;
      video.load();
      once(video, 'loadeddata', 8000).then(() => {
        if (cancelled) return;
        setLoadProgress(1);
        setReady(true);
      });
    };

    (async () => {
      try {
        const res = await fetch(src);
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const total = Number(res.headers.get('content-length')) || 0;
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (cancelled) {
            void reader.cancel();
            return;
          }
          chunks.push(value);
          received += value.length;
          // Hold the last sliver back for the decoder warm-up.
          if (total) setLoadProgress(clamp(received / total) * 0.94);
        }

        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob(chunks as BlobPart[], { type: 'video/mp4' }));
        video.src = objectUrl;
        video.load();
        await once(video, 'loadedmetadata', 5000);
        if (cancelled) return;

        // Warm the decoder. Without this the first scroll pays a cold-start
        // cost and visibly lurches.
        try {
          await video.play();
        } catch {
          /* autoplay may be refused even when muted; the seek below still primes it */
        }
        video.pause();
        setLoadProgress(0.98);
        video.currentTime = 0.5 / fps;
        await once(video, 'seeked', 1200);
        if (cancelled) return;

        setLoadProgress(1);
        setReady(true);
      } catch {
        streamFallback();
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, fps]);

  /* ---------------------------------------------------------------- *
   * 2. One ScrollTrigger produces progress. One rAF loop consumes it,
   *    drives the film, and fans the timeline out to every subscriber.
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!ready) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const duration = video.duration;
    if (!duration || !Number.isFinite(duration)) return;

    const frameDur = 1 / fps;
    const totalFrames = Math.max(1, Math.floor(duration * fps));

    const driver = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        rawRef.current = self.progress;
      },
    });

    // Cheap on/off so the loop idles when the film is nowhere near the viewport.
    let onScreen = true;
    const visibility = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        onScreen = self.isActive;
      },
    });

    // Settle the timeline on the real scroll position before the first frame.
    // A reload deep in the page must not initialise as if progress were zero.
    ScrollTrigger.refresh();
    rawRef.current = driver.progress;

    let rafId = 0;
    let last = performance.now();
    let smooth = driver.progress;
    let primed = false;
    let requested = -1;
    let pending = false;
    let pendingSince = 0;

    const releaseSeek = () => {
      pending = false;
    };
    video.addEventListener('seeked', releaseSeek);
    const canUseFrameCallback = typeof video.requestVideoFrameCallback === 'function';

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      // Cap dt so returning to a backgrounded tab doesn't teleport the film.
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;

      const raw = rawRef.current;
      const settled = Math.abs(raw - smooth) < 1e-5;
      // Idle only once the timeline has stopped moving, the film is off
      // screen, AND every subscriber has seen the settled value at least
      // once — otherwise the overlay can be left describing a frame that is
      // no longer on screen.
      if (settled && !onScreen && primed) return;

      smooth = settled ? raw : damp(smooth, raw, TAU, dt);

      // Land on the middle of a frame slot. Seeking to an exact frame boundary
      // is ambiguous and makes some decoders hand back the previous frame,
      // which reads as a stutter even though the scroll was perfectly smooth.
      const frame = clamp(Math.floor(smooth * duration * fps), 0, totalFrames - 1);
      const want = (frame + 0.5) * frameDur;

      if (pending && now - pendingSince > SEEK_TIMEOUT_MS) pending = false;

      // Never queue a seek while one is in flight. Overlapping seeks are the
      // single biggest source of judder: the decoder drops the intermediate
      // targets and the picture jumps between whatever it managed to finish.
      if (!pending && Math.abs(want - requested) >= frameDur * 0.5) {
        requested = want;
        pending = true;
        pendingSince = now;
        if (canUseFrameCallback) video.requestVideoFrameCallback!(releaseSeek);
        video.currentTime = want;
      }

      const state = stateRef.current;
      state.raw = raw;
      state.progress = smooth;
      state.time = smooth * duration;
      state.duration = duration;
      primed = true;
      listeners.current.forEach((cb) => cb(state));
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('seeked', releaseSeek);
      driver.kill();
      visibility.kill();
    };
  }, [ready, fps]);

  return { sectionRef, videoRef, ready, loadProgress, subscribe };
}
