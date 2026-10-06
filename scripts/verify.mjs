/** Confirms the shipped assets are all-intra: an mp4 with no `stss` atom
 *  declares every sample a sync sample, i.e. every frame is a keyframe. */
import { readFileSync } from 'node:fs';

for (const file of ['public/media/moses-desktop.mp4', 'public/media/moses-mobile.mp4']) {
  const buf = readFileSync(file);
  let sync = null;
  (function walk(start, end) {
    let p = start;
    while (p + 8 <= end) {
      let size = buf.readUInt32BE(p);
      const type = buf.toString('latin1', p + 4, p + 8);
      let hdr = 8;
      if (size === 1) { size = Number(buf.readBigUInt64BE(p + 8)); hdr = 16; }
      if (size === 0) size = end - p;
      if (size < hdr) break;
      if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(type)) walk(p + hdr, p + size);
      else if (type === 'stss') sync = buf.readUInt32BE(p + hdr + 4);
      p += size;
    }
  })(0, buf.length);

  const ok = sync === null;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}  ` +
    (ok ? 'no stss atom — every frame is a keyframe'
        : `stss present with ${sync} sync samples — scrubbing WILL stutter`));
  if (!ok) process.exitCode = 1;
}
