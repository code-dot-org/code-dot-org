import drawHeart from '@code-dot-org/dance-party/src/shapes/heart';
import drawLovestruck from '@code-dot-org/dance-party/src/shapes/lovestruck';
import drawSmiley from '@code-dot-org/dance-party/src/shapes/smiley';
import drawStar from '@code-dot-org/dance-party/src/shapes/star';
import drawStarstruck from '@code-dot-org/dance-party/src/shapes/starstruck';
import drawTickled from '@code-dot-org/dance-party/src/shapes/tickled';
import drawWink from '@code-dot-org/dance-party/src/shapes/wink';
import * as utils from './utils';

export const commands = {
  setForegroundEffect(effectName) {
    switch (effectName) {
      case 'rain': {
        const drops = [];
        for (let i = 0; i < 20; i++) {
          drops.push({
            x: utils.randomInt(0, 380),
            y: utils.randomInt(0, 380),
            length: utils.randomInt(10, 20)
          });
        }
        this.foregroundEffect = () => {
          this.p5.push();
          this.p5.stroke(this.p5.rgb(92, 101, utils.randomInt(140, 220), 0.5));
          this.p5.strokeWeight(3);
          for (let i = 0; i < drops.length; i++) {
            this.p5.push();
            this.p5.translate(drops[i].x - 20, drops[i].y - 20);
            this.p5.line(0, 0, drops[i].length, drops[i].length * 2);
            drops[i].y = (drops[i].y + drops[i].length) % 420;
            drops[i].x = (drops[i].x + drops[i].length / 2) % 420;
            this.p5.pop();
          }
          this.p5.pop();
        };
        break;
      }
      case 'bubbles': {
        let bubbles = [];
        this.foregroundEffect = () => {
          bubbles.push({
            x: this.p5.random(-100, 400),
            y: 410,
            velocityX: this.p5.random(-2, 2),
            size: this.p5.random(6, 12, 18),
            color: this.getP5Color(utils.randomColor(this.p5), 60)
          });
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
        };
        break;
      }
      case 'hearts': {
        const hearts = [];
        for (let i = 0; i < 10; i++) {
          hearts.push({
            x: utils.randomInt(10, 390),
            y: utils.randomInt(10, 390),
            rotation: utils.randomInt(0, 359),
            size: utils.randomInt(10, 120),
            color: this.getP5Color(utils.randomColor(this.p5), 60)
          });
        }
        this.foregroundEffect = () => {
          hearts.forEach(heart => {
            this.p5.push();
            this.p5.translate(heart.x, heart.y);
            this.p5.rotate(heart.rotation);
            this.p5.scale(heart.size / 20);
            drawHeart(this.p5._renderer.drawingContext, heart.color);
            heart.size--;
            if (heart.size < 0) {
              heart.x = utils.randomInt(10, 390);
              heart.y = utils.randomInt(10, 390);
              heart.size = utils.randomInt(10, 120);
            }
            this.p5.pop();
          });
        };
        break;
      }
      case 'emojis': {
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

        this.foregroundEffect = () => {
          if (this.p5.frameCount % 10 === 0) {
            emojis.push({
              x: utils.randomInt(10, 390),
              y: -50,
              size: utils.randomInt(50, 90),
              image: emojiTypes[utils.randomInt(0, emojiTypes.length - 1)]
            });
          }
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
        };

        break;
      }
      case 'confetti': {
        let confetti = [];
        this.foregroundEffect = () => {
          this.p5.push();
          confetti.push({
            x: utils.randomInt(0, 400),
            y: -10,
            velocityX: this.p5.random(-2, 2),
            size: this.p5.random(6, 12, 18),
            spin: 1,
            color: utils.randomColor(this.p5)
          });
          this.p5.noStroke();
          confetti.forEach(confetto => {
            this.p5.push();
            this.p5.fill(confetto.color);
            this.p5.translate(confetto.x, confetto.y);
            this.p5.scale(this.p5.sin(confetto.spin), 1);
            confetto.spin += 20;
            this.p5.rect(0, 0, 4, confetto.size);
            const fallSpeed = this.p5.map(confetto.size, 6, 12, 1, 3);
            confetto.y += fallSpeed;
            confetto.x += confetto.velocityX;
            this.p5.pop();
          });
          confetti = confetti.filter(confetto => confetto.y < 420);

          this.p5.pop();
        };
        break;
      }
      case 'starburst': {
        let stars = [];
        const resetStars = () => {
          for (let i = 0; i < 100; i++) {
            const theta = utils.randomInt(0, 360);
            const velocity = utils.randomInt(4, 12);
            stars.push({
              color: utils.randomColor(this.p5),
              x: 200,
              y: 200,
              velocityX: velocity * this.p5.cos(theta),
              velocityY: velocity * this.p5.sin(theta)
            });
          }
        };
        this.foregroundEffect = () => {
          this.p5.push();
          if (stars.length === 0) {
            resetStars();
          }

          stars.forEach(star => {
            this.p5.fill(star.color);
            drawStar(this.p5, star.x, star.y, 3, 9, 5);
            star.x += star.velocityX;
            star.y += star.velocityY;
          });
          stars = stars.filter(
            star => star.x > -10 && star.x < 410 && star.y > -10 && star.y < 410
          );
          this.p5.pop();
        };

        break;
      }
      case 'glass':
        break;
      case 'smoke':
        break;
      case 'birds':
        break;
      case 'twinkling': {
        let stars = [];
        const resetStars = () => {
          for (let i = 0; i < 100; i++) {
            stars.push({
              color: utils.randomColor(this.p5),
              x: utils.randomInt(0, 400),
              y: utils.randomInt(0, 400),
              alpha: utils.randomInt(1, 79),
              delta: utils.randomInt(0, 1) ? 0.5 : -0.5
            });
          }
        };

        this.foregroundEffect = () => {
          this.p5.push();
          if (stars.length === 0) {
            resetStars();
          }

          stars.forEach(star => {
            const color = this.getP5Color(star.color, star.alpha);
            this.p5.fill(color);

            star.alpha += star.delta;
            if (star.alpha > 80) {
              star.delta *= -1;
            }
            if (star.alpha < 0) {
              star.delta *= -1;
            }
            drawStar(this.p5, star.x, star.y, 3, 9, 5);
          });
          this.p5.pop();
        };

        break;
      }
      default:
        break;
    }
  }
};
