const DEBUG = true;

const log = [];
if (DEBUG) {
  window.log = log;
}

export default {
  logSprites: (p5) => {
    log.push(p5.allSprites.map(function (sprite) {
      const result = {
        animationLabel: sprite.getAnimationLabel(),
        mirrorX: sprite.mirrorX(),
        rotation: sprite.rotation,
        scale: sprite.scale,
        style: sprite.style,
        tint: p5.color(sprite.tint || 0)._getHue(),
        x: sprite.x,
        y: sprite.y,
      };

      if (sprite.animation) {
        result.animationFrame = sprite.animation.getFrame();
      }

      return result;
    }));
  },

  reset: () => {
    log.length = 0;
  }
};
