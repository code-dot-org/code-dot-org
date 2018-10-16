const DEBUG = true;
const FRAME_LIMIT = 30 * 10; // 10 seconds @ 30 fps
const SPRITE_LIMIT = 25;

const log = [];
if (DEBUG) {
  window.log = log;
}

export default {
  logSprites: (p5) => {
    if (log.length > FRAME_LIMIT) {
      return;
    }

    const spritesToLog = p5.allSprites.slice(0, SPRITE_LIMIT);

    log.push(spritesToLog.map((sprite) => ({
      animationFrame: sprite.animation && sprite.animation.getFrame(),
      animationLabel: sprite.getAnimationLabel(),
      mirrorX: sprite.mirrorX(),
      rotation: sprite.rotation,
      scale: sprite.scale,
      style: sprite.style,
      tint: sprite.tint === undefined ? undefined : p5.color(sprite.tint || 0)._getHue(),
      x: sprite.x,
      y: sprite.y,
    })));
  },

  reset: () => {
    log.length = 0;
  }
};
