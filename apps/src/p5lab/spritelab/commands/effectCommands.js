import drawHeart from '@code-dot-org/dance-party/src/shapes/heart';
import drawLovestruck from '@code-dot-org/dance-party/src/shapes/lovestruck';
import drawSmiley from '@code-dot-org/dance-party/src/shapes/smiley';
import drawStar from '@code-dot-org/dance-party/src/shapes/star';
import drawStarstruck from '@code-dot-org/dance-party/src/shapes/starstruck';
import drawTickled from '@code-dot-org/dance-party/src/shapes/tickled';
import drawWink from '@code-dot-org/dance-party/src/shapes/wink';

import {createUuid} from '@cdo/apps/utils';

import {EFFECTS_PALETTES} from '../../constants';
import * as utils from '../../utils';

export const commands = {
  setForegroundEffect(effectName) {
    const id = createUuid();
    switch (effectName) {
      case 'rain': {
        const numDrops = 20;
        let drops = [];
        for (let i = 0; i < numDrops; i++) {
          drops.push({
            x: utils.randomInt(-400, 380),
            y: utils.randomInt(-50, -20),
            length: utils.randomInt(10, 20),
          });
        }
        this.foregroundEffects.push({
          id,
          name: effectName,
          renderFrame: this.currentFrame(),
          func: () => {
            this.p5.push();
            this.p5.stroke(
              this.p5.rgb(92, 101, utils.randomInt(140, 220), 0.5)
            );
            this.p5.strokeWeight(3);
            for (let i = 0; i < drops.length; i++) {
              this.p5.push();
              this.p5.translate(drops[i].x - 20, drops[i].y - 20);
              this.p5.line(0, 0, drops[i].length, drops[i].length * 2);
              drops[i].y = drops[i].y + drops[i].length;
              drops[i].x = drops[i].x + drops[i].length / 2;
              this.p5.pop();
            }
            drops = drops.filter(drop => drop.y < 420 && drop.x < 420);
            if (drops.length === 0) {
              // Remove this foreground effect once no more drops are visible.
              this.foregroundEffects = this.foregroundEffects.filter(
                effect => effect.id !== id
              );
            }
            this.p5.pop();
          },
        });
        break;
      }
      case 'bubbles': {
        const numBubbles = 25;
        let bubbles = [];
        for (let i = 0; i < numBubbles; i++) {
          bubbles.push({
            x: this.p5.random(-100, 400),
            y: 410,
            velocityX: this.p5.random(-2, 2),
            size: this.p5.random(6, 12, 18),
            color: this.getP5Color(utils.randomColor(this.p5), 60),
          });
        }
        this.foregroundEffects.push({
          id,
          name: effectName,
          renderFrame: this.currentFrame(),
          func: () => {
            this.p5.push();
            this.p5.noStroke();
            bubbles.forEach(bubble => {
              this.p5.fill(bubble.color);
              this.p5.ellipse(bubble.x, bubble.y, bubble.size, bubble.size);
              const fallSpeed = this.p5.map(bubble.size, 6, 12, 1, 3);
              bubble.y -= fallSpeed;
              bubble.x += bubble.velocityX;
              if (bubble.x < 0 || bubble.x > 400) {
                bubble.velocityX *= -1;
              }
            });
            this.p5.pop();
            bubbles = bubbles.filter(bubble => bubble.y > 0);
            if (bubbles.length === 0) {
              // Remove this foreground effect once no more bubbles are visible.
              this.foregroundEffects = this.foregroundEffects.filter(
                effect => effect.id !== id
              );
            }
          },
        });
        break;
      }
      case 'hearts': {
        const numHearts = 15;
        let hearts = [];
        for (let i = 0; i < numHearts; i++) {
          hearts.push({
            x: utils.randomInt(10, 390),
            y: utils.randomInt(10, 390),
            rotation: utils.randomInt(0, 359),
            size: utils.randomInt(10, 120),
            color: this.getP5Color(utils.randomColor(this.p5), 60),
          });
        }
        this.foregroundEffects.push({
          id,
          name: effectName,
          renderFrame: this.currentFrame(),
          func: () => {
            hearts.forEach(heart => {
              this.p5.push();
              this.p5.translate(heart.x, heart.y);
              this.p5.rotate(heart.rotation);
              this.p5.scale(heart.size / 20);
              drawHeart(this.p5._renderer.drawingContext, heart.color);
              heart.size--;
              this.p5.pop();
            });
            hearts = hearts.filter(heart => heart.size > 0);
            if (hearts.length === 0) {
              // Remove this foreground effect once no more hearts are visible.
              this.foregroundEffects = this.foregroundEffects.filter(
                effect => effect.id !== id
              );
            }
          },
        });
        break;
      }
      case 'emojis': {
        const numEmojis = 15;
        const lovestruck = this.p5.createGraphics(100, 100);
        lovestruck.scale(3);
        drawLovestruck(lovestruck.drawingContext);

        const smiley = this.p5.createGraphics(100, 100);
        smiley.scale(3);
        drawSmiley(smiley.drawingContext, 1.0);

        const starstruck = this.p5.createGraphics(100, 100);
        starstruck.scale(3);
        drawStarstruck(starstruck.drawingContext);

        const tickled = this.p5.createGraphics(100, 100);
        tickled.scale(3);
        drawTickled(tickled.drawingContext);

        const wink = this.p5.createGraphics(100, 100);
        wink.scale(3);
        drawWink(wink.drawingContext);

        const emojiTypes = [lovestruck, smiley, starstruck, tickled, wink];
        let emojis = [];
        for (let i = 0; i < numEmojis; i++) {
          emojis.push({
            x: utils.randomInt(10, 390),
            y: utils.randomInt(-100, -50),
            size: utils.randomInt(50, 90),
            image: emojiTypes[utils.randomInt(0, emojiTypes.length - 1)],
          });
        }

        this.foregroundEffects.push({
          id,
          name: effectName,
          renderFrame: this.currentFrame(),
          func: () => {
            emojis.forEach(emoji => {
              emoji.y += this.p5.pow(emoji.size, 0.25);
              this.p5.push();
              this.p5.drawingContext.drawImage(
                emoji.image.elt,
                emoji.x,
                emoji.y,
                emoji.size,
                emoji.size
              );
              this.p5.pop();
            });
            emojis = emojis.filter(emoji => emoji.y < 450);
            if (emojis.length === 0) {
              // Remove this foreground effect once no more emojis are visible.
              this.foregroundEffects = this.foregroundEffects.filter(
                effect => effect.id !== id
              );
            }
          },
        });

        break;
      }
      case 'confetti': {
        const numConfetti = 25;
        let confetti = [];
        for (let i = 0; i < numConfetti; i++) {
          confetti.push({
            x: utils.randomInt(0, 400),
            y: utils.randomInt(-50, -20),
            velocityX: this.p5.random(-2, 2),
            size: this.p5.random(6, 12, 18),
            spin: 1,
            color: utils.randomColor(this.p5),
          });
        }
        this.foregroundEffects.push({
          id,
          name: effectName,
          renderFrame: this.currentFrame(),
          func: () => {
            this.p5.push();
            this.p5.noStroke();
            confetti.forEach(confetto => {
              this.p5.push();
              this.p5.fill(confetto.color);
              this.p5.translate(confetto.x, confetto.y);
              this.p5.scale(this.p5.sin(confetto.spin), 1);
              confetto.spin += 20;
              this.p5.rect(0, 0, 4, confetto.size);
              const fallSpeed = this.p5.map(confetto.size, 6, 12, 3, 6);
              confetto.y += fallSpeed;
              confetto.x += confetto.velocityX;
              this.p5.pop();
            });
            confetti = confetti.filter(confetto => confetto.y < 420);
            if (confetti.length === 0) {
              // Remove this foreground effect once no more confetti are visible.
              this.foregroundEffects = this.foregroundEffects.filter(
                effect => effect.id !== id
              );
            }

            this.p5.pop();
          },
        });
        break;
      }
      case 'starburst': {
        const numStars = 100;
        let stars = [];
        for (let i = 0; i < numStars; i++) {
          const theta = utils.randomInt(0, 360);
          const velocity = utils.randomInt(4, 12);
          stars.push({
            color: utils.randomColor(this.p5),
            x: 200,
            y: 200,
            velocityX: velocity * this.p5.cos(theta),
            velocityY: velocity * this.p5.sin(theta),
          });
        }
        this.foregroundEffects.push({
          id,
          name: effectName,
          renderFrame: this.currentFrame(),
          func: () => {
            this.p5.push();
            this.p5.noStroke();

            stars.forEach(star => {
              this.p5.fill(star.color);
              drawStar(this.p5, star.x, star.y, 3, 9, 5);
              star.x += star.velocityX;
              star.y += star.velocityY;
            });
            stars = stars.filter(
              star =>
                star.x > -10 && star.x < 410 && star.y > -10 && star.y < 410
            );
            if (stars.length === 0) {
              // Remove this foreground effect once no more stars are visible.
              this.foregroundEffects = this.foregroundEffects.filter(
                effect => effect.id !== id
              );
            }
            this.p5.pop();
          },
        });

        break;
      }
      case 'glass': {
        const numGlassShards = 100;
        let glassShards = [];
        const shardRadius = 10;

        const drawGlass = glass => {
          this.p5.fill(this.getP5Color(glass.color, 100));
          this.p5.beginShape();
          glass.points.forEach(point => {
            this.p5.vertex(point.x, point.y);
            point.x += point.velocityX;
            point.y += point.velocityY;
          });
          this.p5.endShape();
        };

        for (let i = 0; i < numGlassShards; i++) {
          const numPoints = utils.randomInt(3, 9);
          const points = [];
          const velocity = utils.randomInt(4, 12);
          const theta = utils.randomInt(0, 360);
          for (let i = 0; i < numPoints; i++) {
            points.push({
              x: utils.randomInt(200 - shardRadius, 200 + shardRadius),
              y: utils.randomInt(200 - shardRadius, 200 + shardRadius),
              velocityX: velocity * this.p5.cos(theta),
              velocityY: velocity * this.p5.sin(theta),
            });
          }
          glassShards.push({
            points: points,
            color: utils.randomColorFromPalette(EFFECTS_PALETTES['ocean']),
          });
        }
        this.foregroundEffects.push({
          id,
          name: effectName,
          renderFrame: this.currentFrame(),
          func: () => {
            this.p5.push();
            this.p5.noStroke();
            glassShards.forEach(glass => drawGlass(glass));
            glassShards = glassShards.filter(glass =>
              // the glass shard is considered in bounds if at least one vertex
              // is in bounds
              glass.points.some(
                point =>
                  point.x > 0 && point.x < 400 && point.y > 0 && point.y < 400
              )
            );
            if (glassShards.length === 0) {
              // Remove this foreground effect once no more glassShards are visible.
              this.foregroundEffects = this.foregroundEffects.filter(
                effect => effect.id !== id
              );
            }
            this.p5.pop();
          },
        });

        break;
      }
      case 'twinkling': {
        const numStars = 75;
        let stars = [];
        for (let i = 0; i < numStars; i++) {
          stars.push({
            color: utils.randomColorFromPalette(EFFECTS_PALETTES['twinkling']),
            x: utils.randomInt(0, 400),
            y: utils.randomInt(0, 400),
            alpha: utils.randomInt(1, 100),
            // amount to change the opacity by each frame. p5.random will choose
            // a random value from the array. The reason it's not just random(-6, 6)
            // is that we don't want stars with delta values between 0 and +/-2
            // because they change too slowly to feel noticeable.
            delta: this.p5.random([-6, -5, -4, -3, 3, 4, 5, 6]),
          });
        }

        this.foregroundEffects.push({
          id,
          name: effectName,
          renderFrame: this.currentFrame(),
          func: () => {
            this.p5.push();
            this.p5.noStroke();
            stars.forEach(star => {
              const color = this.getP5Color(star.color, star.alpha);
              this.p5.fill(color);

              star.alpha += star.delta;
              if (star.alpha > 100) {
                star.delta *= -1;
              }
              drawStar(this.p5, star.x, star.y, 3, 9, 5);
            });
            stars = stars.filter(star => star.alpha > 0);
            if (stars.length === 0) {
              // Remove this foreground effect once no more stars are visible.
              this.foregroundEffects = this.foregroundEffects.filter(
                effect => effect.id !== id
              );
            }
            this.p5.pop();
          },
        });
        break;
      }
      default:
        break;
    }
  },
};
