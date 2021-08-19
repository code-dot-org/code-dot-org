import * as utils from './utils';
export const commands = {
  // TODO: would it be possible to re-use the background/foreground effect code from dance party?
  setBackgroundEffect(effectName, palette) {
    switch (effectName) {
      case 'colors': {
        let amount = 0;
        this.backgroundEffect = () => {
          amount += 0.02;
          this.p5.background(
            utils.lerpColorFromPalette(this.p5, palette, amount)
          );
        };
        break;
      }
      case 'darkCircles': {
        const circles = [];
        const NUM_CIRCLES = 20;
        const createCircle = () => ({
          x: utils.randomInt(0, 400),
          y: utils.randomInt(0, 400),
          radius: utils.randomInt(20, 60),
          hex: utils.randomColorFromPalette(palette),
          alpha: utils.randomInt(1, 79),
          delta: utils.randomInt(0, 1) ? 0.5 : -0.5
        });

        for (let i = 0; i < NUM_CIRCLES; i++) {
          circles.push(createCircle());
        }
        this.backgroundEffect = () => {
          this.p5.background('black');
          for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            const color = this.getP5Color(circle.hex, circle.alpha);
            circle.alpha += circle.delta;
            if (circle.alpha > 80) {
              circle.delta *= -1;
            }
            if (circle.alpha < 0) {
              circles[i] = createCircle();
            }
            this.p5.fill(color);
            this.p5.ellipse(
              circle.x,
              circle.y,
              circle.radius * 2,
              circle.radius * 2
            );
          }
        };
        break;
      }
    }
  }
};
