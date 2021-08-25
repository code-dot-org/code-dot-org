import * as utils from './utils';
import {PALETTES} from '../constants';
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
      case 'squiggles': {
        const points = [];
        const dotSpacing = 4;
        const amplitude = 40;
        const period = 400;
        const dotRadius = 14;
        const numSquiggles = 5;
        const numPoints = this.p5.height / dotSpacing;
        for (let i = 0; i < numPoints; i++) {
          points.push({
            x: 0,
            y: i * dotSpacing,
            theta: (360 / period) * i * dotSpacing,
            color: utils.lerpColorFromPalette(
              this.p5,
              palette,
              (i / numPoints) * utils.PALETTES[palette].length
            )
          });
        }
        this.backgroundEffect = () => {
          this.p5.push();
          this.p5.noStroke();
          this.p5.background('black');
          for (let i = 0; i < numSquiggles; i++) {
            points.forEach(point => {
              point.x =
                (this.p5.width / (numSquiggles - 1)) * i +
                this.p5.sin(point.theta) * amplitude;
              point.theta = (point.theta + 1) % 360;
              this.p5.fill(point.color);
              this.p5.ellipse(point.x, point.y, dotRadius, dotRadius);
            });
          }
          this.p5.pop();
        };
        break;
      }
      case 'space': {
        let stars = [];
        this.backgroundEffect = () => {
          this.p5.push();
          this.p5.background('black');
          for (let i = 0; i < 3; i++) {
            stars.push({
              x: 200,
              y: 200,
              velocity: this.p5
                .createVector(0, 1)
                .rotate(this.p5.random(0, 360)),
              size: 0.01,
              color: utils.randomColorFromPalette(palette)
            });
          }
          this.p5.noStroke();
          stars.forEach(star => {
            this.p5.fill(star.color);
            this.p5.ellipse(star.x, star.y, star.size, star.size);
            const speedMultiplier = this.p5.pow(star.size, 2) / 2;
            star.x += star.velocity.x * speedMultiplier;
            star.y += star.velocity.y * speedMultiplier;
            star.size += 0.1;
          });
          stars = stars.filter(
            star => star.x > -5 && star.x < 405 && star.y > -5 && star.y < 405
          );
          this.p5.pop();
        };
        break;
      }
      case 'stars': {
        let stars = [];
        this.backgroundEffect = () => {
          this.p5.push();
          this.p5.background('#303030');
          stars.push({
            x: utils.randomInt(0, 400),
            y: utils.randomInt(0, 400),
            size: utils.randomInt(15, 30),
            color: utils.randomColorFromPalette(palette)
          });
          this.p5.noStroke();
          stars.forEach(star => {
            this.p5.push();
            this.p5.fill(star.color);
            this.p5.translate(star.x, star.y);
            for (let i = 0; i < 3; i++) {
              this.p5.rotate(360 / 5);
              this.p5.ellipse(0, 0, 1, star.size);
            }
            let fadeSpeed = this.p5.map(star.size, 15, 30, 1, 2);
            star.size -= fadeSpeed;
            star.y -= 2;
            this.p5.pop();
          });
          stars = stars.filter(star => star.size > 0.1);
          this.p5.pop();
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
      case 'fadeColors': {
        const anchors = [];
        const circles = [];
        const spacing = 20;

        const getMappedColorValue = (color, x, y, anchor) => {
          const distance = Math.sqrt((anchor.x - x) ** 2 + (anchor.y - y) ** 2);
          return this.p5.map(
            distance ** 0.25,
            565 ** 0.25,
            0,
            0,
            anchor[color]
          );
        };

        PALETTES[palette].forEach(color => {
          anchors.push({
            x: utils.randomInt(0, 400),
            y: utils.randomInt(0, 400),
            velocityX: utils.randomInt(-3, 3),
            velocityY: utils.randomInt(-3, 3),
            ...utils.hexToRgb(color)
          });
        });
        for (let x = 0; x < 420; x += spacing) {
          for (let y = 0; y < 420; y += spacing) {
            circles.push({x, y, red: 0, green: 0, blue: 0});
          }
        }

        this.backgroundEffect = () => {
          this.p5.push();
          this.p5.noStroke();
          anchors.forEach(anchor => {
            anchor.x += anchor.velocityX;
            if (anchor.x < 0 || anchor.x > 400) {
              anchor.velocityX *= -1;
            }
            anchor.y += anchor.velocityY;
            if (anchor.y < 0 || anchor.y > 400) {
              anchor.velocityY *= -1;
            }
          });
          circles.forEach(circle => {
            let red = 0;
            let green = 0;
            let blue = 0;
            anchors.forEach(anchor => {
              red += getMappedColorValue('R', circle.x, circle.y, anchor);
              green += getMappedColorValue('G', circle.x, circle.y, anchor);
              blue += getMappedColorValue('B', circle.x, circle.y, anchor);
            });
            this.p5.fill(this.p5.color(red, green, blue));
            this.p5.ellipse(circle.x, circle.y, spacing * 2, spacing * 2);
          });
          this.p5.pop();
        };

        break;
      }
    }
  }
};
