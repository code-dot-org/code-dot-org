import * as utils from './utils';
import {PALETTES} from '../constants';
import {APP_WIDTH, APP_HEIGHT} from '../../constants';

export const commands = {
  setBackground(color) {
    this.validationInfo.backgroundEffect = color;
    this.backgroundEffect = () => {
      this.p5.background(color);
    };
  },

  setBackgroundImageAs(imageName) {
    const backgroundImage = this.p5._predefinedSpriteAnimations?.[imageName];
    if (backgroundImage) {
      backgroundImage.name = imageName;
      backgroundImage.resize(APP_WIDTH, APP_HEIGHT);
      this.backgroundEffect = () => {
        this.p5.image(backgroundImage);
      };
    }
  },

  // TODO: would it be possible to re-use the background/foreground effect code from dance party?
  setBackgroundEffect(effectName, palette) {
    this.validationInfo.backgroundEffect = effectName;
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
              (i / numPoints) * PALETTES[palette].length
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
          this.p5.push();
          this.p5.noStroke();
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
          this.p5.pop();
        };
        break;
      }
      case 'fadeColors': {
        const anchors = [];
        const circles = [];
        const spacing = 20;

        const getMappedColorValue = (color, x, y, anchor) => {
          const distance = Math.sqrt((anchor.x - x) ** 2 + (anchor.y - y) ** 2);
          // The amount that each anchor point contributes to the color of each
          // circle is proportional to the fourth root of the distance to
          // prevent the colors from getting too washed out.
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
      case 'blooming': {
        let colorIndex = 0;
        const petalWidth = 35;
        let petals = [];
        const addPetalLayer = (color, layer) => {
          for (let i = 0; i < 8; i++) {
            petals.push({
              theta: 45 * i,
              length: 10 + 140 * layer,
              ...color
            });
          }
        };

        // initialize with enough petals to fill the screen - this is mostly
        // useful so that preview shows what the background actually looks like.
        // increment from 3 down to 0 so that petals are layered correctly with
        // bigger petals behind smaller peals.
        for (let layer = 3; layer >= 0; layer--) {
          const color = utils.hexToRgb(PALETTES[palette][colorIndex]);
          addPetalLayer(color, layer);
          colorIndex = (colorIndex + 1) % PALETTES[palette].length;
        }

        this.backgroundEffect = () => {
          this.p5.push();
          this.p5.strokeWeight(2);
          if (this.p5.World.frameCount % 70 === 0) {
            const color = utils.hexToRgb(PALETTES[palette][colorIndex]);
            addPetalLayer(color, 0 /* layer */);
            colorIndex = (colorIndex + 1) % PALETTES[palette].length;
          }

          petals.forEach(petal => {
            // Multiply each component by 0.8 to have the stroke color be
            // slightly darker than the fill color.
            this.p5.stroke(
              this.p5.color(petal.R * 0.8, petal.G * 0.8, petal.B * 0.8)
            );
            this.p5.fill(this.p5.color(petal.R, petal.G, petal.B));
            const leftAnchor = {
              x: 200 + petal.length * this.p5.sin(petal.theta - petalWidth),
              y: 200 + petal.length * this.p5.cos(petal.theta - petalWidth)
            };
            const rightAnchor = {
              x: 200 + petal.length * this.p5.sin(petal.theta + petalWidth),
              y: 200 + petal.length * this.p5.cos(petal.theta + petalWidth)
            };
            this.p5.bezier(
              200,
              200,
              leftAnchor.x,
              leftAnchor.y,
              rightAnchor.x,
              rightAnchor.y,
              200,
              200
            );
            petal.theta = (petal.theta + 0.5) % 360;
            petal.length += 2;
          });
          petals = petals.filter(petal => petal.length < 700);
          this.p5.pop();
        };

        break;
      }
      case 'ripples': {
        palette = PALETTES[palette];
        let ripples = [];
        let startRipple = false;
        let colorIndex = 0;
        const rippleSpacing = 30;
        const rippleSpeed = 4;
        const frameDelay = 4;
        const rippleNumber = palette.length - 1;

        for (let i = 0; i < rippleNumber; i++) {
          ripples.push({
            size: (i + 1) * rippleSpacing,
            color: palette[colorIndex]
          });
          colorIndex = (colorIndex + 1) % palette.length;
        }

        this.backgroundEffect = () => {
          this.p5.push();
          this.p5.noFill();
          this.p5.strokeWeight(3);
          if (startRipple && this.p5.frameCount % frameDelay === 0) {
            ripples.push({
              size:
                rippleSpacing +
                ripples.length * (rippleSpacing + rippleSpeed * frameDelay),
              color: palette[colorIndex]
            });
            colorIndex = (colorIndex + 1) % palette.length;
            if (ripples.length === rippleNumber) {
              startRipple = false;
            }
          }

          if (ripples.length > 0) {
            // the actual background color is not fully opaque so we need to
            // "clear out" the previous frame first so we don't see a remnant of it.
            this.p5.background('white');
            this.p5.background(this.getP5Color(ripples[0].color, 100));
          }

          ripples.forEach(ripple => {
            const alpha = this.p5.map(ripple.size, 400, 0, 0, 255);
            this.p5.stroke(this.getP5Color(ripple.color, alpha));
            this.p5.ellipse(200, 200, ripple.size, ripple.size);
            ripple.size += rippleSpeed;
          });
          ripples = ripples.filter(ripple => ripple.size < 500);
          if (ripples.length === 0) {
            startRipple = true;
          }
          this.p5.pop();
        };
        break;
      }
      case 'clouds': {
        const tileSize = 8;
        const noiseScale = 0.05;
        const speed = 0.015;
        const tiles = [];
        let xnoise = 0.01;
        let ynoise = 0.01;
        let backgroundAmount = 0;
        for (let x = 0; x < 400; x += tileSize) {
          xnoise = 0.01;
          for (let y = 0; y < 400; y += tileSize) {
            tiles.push({
              x,
              y,
              xnoise,
              ynoise
            });
            xnoise += noiseScale;
          }
          ynoise += noiseScale;
        }

        this.backgroundEffect = () => {
          this.p5.push();
          this.p5.noStroke();
          backgroundAmount += speed;
          this.p5.background(
            utils.lerpColorFromPalette(this.p5, palette, backgroundAmount)
          );
          tiles.forEach(tile => {
            tile.alpha = this.p5.noise(tile.xnoise, tile.ynoise) * 255;
            tile.xnoise += speed;
            tile.ynoise += speed;
            this.p5.fill(this.getP5Color('#ffffff', tile.alpha));
            this.p5.rect(tile.x, tile.y, tileSize, tileSize);
          });
          this.p5.pop();
        };
        break;
      }
    }
  }
};
