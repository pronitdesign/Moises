/**
 * Re-encodes a source film into the two all-intra assets the scroll scrubber
 * needs, plus posters.
 *
 *   npm run encode -- ~/Downloads/Heroq4.mp4
 *
 * WHY ALL-INTRA: seeking can only land on a keyframe boundary cheaply. The
 * original file carried 2 keyframes across 362 frames, so every scroll step
 * forced the decoder to walk up to 180 frames forward from the last one —
 * that is the stutter. Encoding with keyint=1 makes every frame a keyframe,
 * so any currentTime lands in one decode. It costs file size; it buys a
 * scrub that never skips.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

const src = process.argv[2];
if (!src) {
  console.error('usage: npm run encode -- <source-video>');
  process.exit(1);
}

const OUT = 'public/media';
mkdirSync(OUT, { recursive: true });

const INTRA = 'keyint=1:min-keyint=1:scenecut=0:ref=1:bframes=0';
const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
  stdio: 'inherit',
});

const intra = (extra, out) =>
  run([
    '-i', src,
    '-an',
    ...extra,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
    '-g', '1', '-keyint_min', '1', '-x264-params', INTRA,
    '-profile:v', 'high', '-movflags', '+faststart',
    out,
  ]);

console.log('· landscape 1920x1080 (all-intra)');
intra(['-level', '4.2'], `${OUT}/moses-desktop.mp4`);

console.log('· portrait 9:16 centre crop (all-intra)');
intra(['-vf', 'crop=608:1080:656:0', '-level', '4.0'], `${OUT}/moses-mobile.mp4`);

console.log('· posters');
run(['-ss', '0', '-i', src, '-frames:v', '1', '-q:v', '4', `${OUT}/poster-desktop.jpg`]);
run(['-ss', '0', '-i', src, '-frames:v', '1', '-vf', 'crop=608:1080:656:0', '-q:v', '4',
     `${OUT}/poster-mobile.jpg`]);

console.log('· next-episode still');
run(['-ss', '0.2', '-i', src, '-frames:v', '1',
     '-vf', 'crop=1920:430:0:10,scale=1600:358:flags=lanczos,' +
            'eq=saturation=0.5:contrast=1.12:brightness=-0.03,' +
            'colorbalance=rs=0.08:rm=0.05:bs=-0.06',
     '-q:v', '4', `${OUT}/next-episode.jpg`]);

console.log('\ndone. Verify every frame is a keyframe:');
console.log('  npm run verify');
