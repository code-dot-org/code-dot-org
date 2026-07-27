// Preview-surface harness entry (Spike C, Q2 + Q3).
//
// Boots Phaser under a bare `script-src 'self'` and renders a sprite (Q2 —
// runtime confirmation that Phaser needs no eval/wasm), then tries to import a
// compiled module two ways: from a same-origin URL (Q3, the preferred SW
// transport) and from a blob: URL (the fallback). The Node driver reads the
// reported result and the CSP-violation log.
import Phaser from 'phaser';

const report = r => {
  // eslint-disable-next-line no-console
  console.log('SPIKE_RESULT ' + JSON.stringify(r));
};

// Q2: render a sprite with the Canvas renderer (WebGL is unreliable headless).
function renderPhaser() {
  return new Promise(resolve => {
    let frames = 0;
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      width: 64,
      height: 64,
      banner: false,
      backgroundColor: '#101020',
      audio: {noAudio: true},
      scene: {
        create() {
          // A generated texture used as a sprite — no network image needed.
          const g = this.add.graphics();
          g.fillStyle(0x33cc66, 1);
          g.fillRect(0, 0, 24, 24);
          g.generateTexture('block', 24, 24);
          g.destroy();
          this.add.sprite(32, 32, 'block');
        },
        update() {
          // Read only after a few composited frames — the first update fires
          // before the renderer has painted, which reads back blank.
          if (++frames !== 5) return;
          const src = game.canvas;
          const c = document.createElement('canvas');
          c.width = src.width;
          c.height = src.height;
          const ctx = c.getContext('2d');
          ctx.drawImage(src, 0, 0);
          const px = ctx.getImageData(32, 32, 1, 1).data;
          resolve({
            rendered: true,
            centerPixel: [px[0], px[1], px[2], px[3]],
            // The sprite is green (~0x33cc66) over a dark bg; a lit green
            // channel with a low red channel proves the sprite actually drew.
            spriteDrew: px[1] > 100 && px[0] < 120,
          });
        },
      },
    });
    setTimeout(() => resolve({rendered: false, timeout: true}), 5000);
  });
}

// Q3: dynamic import under CSP, two transports.
async function importSameOrigin() {
  try {
    const m = await import('/compiled.mjs');
    return {ok: true, value: m.default};
  } catch (e) {
    return {ok: false, error: String(e && e.message ? e.message : e)};
  }
}

async function importBlob() {
  try {
    const code = 'export default "from-blob";';
    const url = URL.createObjectURL(
      new Blob([code], {type: 'text/javascript'}),
    );
    const m = await import(/* @vite-ignore */ url);
    return {ok: true, value: m.default};
  } catch (e) {
    return {ok: false, error: String(e && e.message ? e.message : e)};
  }
}

const phaser = await renderPhaser();
const sameOrigin = await importSameOrigin();
const blob = await importBlob();
report({phaser, sameOrigin, blob});
