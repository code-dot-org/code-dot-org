const log = [];

export default function wrap(p5) {
  const origDrawSprites = p5.drawSprites;
  p5.drawSprites = function () {
    origDrawSprites.apply(p5, arguments);
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
  };
}

window.log = log;
