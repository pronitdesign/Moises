# The Book — Ep. 04 · Moses Parts the Red Sea

A scroll-controlled cinematic episode. React + TypeScript + GSAP ScrollTrigger, plain CSS, no
UI framework and no scroll-hijacking library.

```bash
npm install
npm run dev      # http://localhost:5180
npm run build
npm run verify   # asserts the video assets are still all-intra
```

## The scrubbing problem, and the fix

The supplied `Heroq4.mp4` was 1920×1080, 24fps, 15.04s — **362 frames carrying only 2
keyframes**. Seeking a video can only resolve cheaply at a keyframe, so every scroll step forced
the decoder to walk up to ~180 frames forward from the previous keyframe. That is what made the
scrub judder and jump: it wasn't the scroll code, it was the file.

Three things fix it, in order of importance:

1. **All-intra re-encode** (`keyint=1`). Every frame becomes a keyframe, so any `currentTime`
   resolves in a single decode. Verify with `npm run verify` — an mp4 with no `stss` atom
   declares every sample a sync sample.
2. **Whole file in memory.** The engine `fetch`es the mp4, builds a `Blob`, and plays from an
   object URL, so no seek can ever hit the network mid-scroll. The download drives the
   preloader's progress bar.
3. **One seek in flight at a time.** Assigning `currentTime` on every scroll event is the classic
   mistake — the decoder drops the intermediate targets and the picture jumps between whatever it
   managed to finish. The engine issues a seek only once the previous one has reported back via
   `requestVideoFrameCallback` (falling back to `seeked`, with a 240ms deadlock release).

Plus two details that matter more than they look:

- **Frame-grid quantisation.** Targets land on `(frame + 0.5) / fps`, the *middle* of a frame
  slot. Seeking to an exact frame boundary is ambiguous and makes some decoders hand back the
  previous frame — a stutter with a perfectly smooth scroll behind it.
- **Exponential damping** (`TAU = 0.11s`, frame-rate independent). This is what makes it feel
  cinematic rather than mechanically pinned to the scrollbar.

### Measured result

Automated in Chrome, counting frames the compositor **actually presented** via
`requestVideoFrameCallback` (not what was requested):

| Scroll duration | Frames shown | Largest gap | Backward jumps | Settles at |
|---|---|---|---|---|
| 9s (normal)  | **360 / 361** | **1 frame** | 0 | 15.02s |
| 4s (fast flick) | 245 / 361 | 2 frames | 0 | 15.02s |

At normal scrolling speed every single frame is presented, in order, with no skips — the full
15 seconds, end to end. Page holds 60fps. Identical numbers on the portrait asset.

> Note: the first measurement of this looked like 66% coverage with 2-frame gaps. That was a bug
> in the *test*, not the engine — recovering a frame index with `round(t * 24 - 0.5)` collapses
> adjacent frames through float error. The correct recovery is `round(t * 24)`.

## Architecture

One `ScrollTrigger` produces progress; one rAF loop consumes it and fans the timeline out to
subscribers. Cards, the chapter rail and the timecode all read that single normalised value and
write **straight to the DOM** — scrubbing triggers zero React renders.

```
useScrollVideo()  → { sectionRef, videoRef, ready, loadProgress, subscribe }
```

Card visibility is *computed* from progress (ease-in ramp, hold, ease-out ramp) rather than
driven by per-card triggers, so scrubbing backwards is exact and nothing can desync on a fast
flick.

The visual pin is CSS `position: sticky`, not GSAP `pin: true`. Same result, but no pin-spacer
and no sub-pixel jitter — and jitter was the thing to avoid. ScrollTrigger is still the single
source of progress.

Native scrolling is deliberately left alone. The damping on the film and the card ramps supply
the smoothness; a scroll-hijacking library would add input latency and fight the sticky.

## Assets

`npm run encode -- <source.mp4>` regenerates everything (uses a bundled ffmpeg binary, no
Homebrew needed):

| File | |
|---|---|
| `moses-desktop.mp4` | 1920×1080 all-intra, 15MB |
| `moses-mobile.mp4` | 608×1080 9:16 centre crop, all-intra, 5.2MB |
| `poster-*.jpg` | first frame |
| `next-episode.jpg` | graded cliff still for the Ep. 05 card |

**If you swap the footage, you must re-encode.** Dropping a normally-encoded mp4 into
`public/media` brings the stutter straight back. `npm run verify` catches it.

The 15MB desktop asset is the cost of all-intra at 1080p. It is downloaded once, up front,
behind the preloader.

## Layout notes

Moses sits dead-centre for the entire 15 seconds, so the centre band is kept clear: cards
alternate on the flanks, the chapter rail hugs the right edge, and on portrait the cards drop to
the bottom of the frame. The palette is taken from the footage — bone `#F0EEE6`, ink `#090908`,
and the water's teal `#86C3BD` used only at hairline scale.

## Known limits

- Verified in Chrome only. Safari should behave (all-intra + blob is the friendliest case for
  it), but the `backdrop-filter` header over a seeking video is the thing to sanity-check there.
- Film grain is static. An animated grain layer over a full-screen video forces a full-frame
  re-blend every frame, which is exactly the budget the scrub needs.
