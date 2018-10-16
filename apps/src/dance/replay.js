const DEBUG = true;

const log = [];
if (DEBUG) {
  window.log = log;
}

export default {
  logSprites: (p5) => {
    log.push(p5.allSprites.map((sprite) => ({
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
