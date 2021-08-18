import CoreLibrary from './CoreLibrary';
import {commands as backgroundEffects} from '../commands/poembot/backgroundEffects';
import {commands as foregroundEffects} from '../commands/poembot/foregroundEffects';

const OUTER_MARGIN = 50;
const LINE_HEIGHT = 50;
const FONT_SIZE = 25;
const PLAYSPACE_SIZE = 400;

export default class PoemBotLibrary extends CoreLibrary {
  constructor(p5) {
    super(p5);
    this.poemState = {
      title: '',
      author: '',
      lines: [],
      color: 'black',
      font: 'Arial',
      isVisible: true,
      effects: []
    };
    this.backgroundEffect = () => this.p5.background('white');
    this.foregroundEffect = () => {};
    this.lineEvents = {};
    this.p5.noStroke();
    this.p5.textAlign(this.p5.CENTER);

    this.commands = {
      // Keep everything from Core Sprite Lab
      ...this.commands,

      // Override the draw loop
      executeDrawLoopAndCallbacks() {
        this.backgroundEffect();
        this.runBehaviors();
        this.runEvents();
        this.p5.drawSprites();
        const renderInfo = this.getRenderInfo(
          this.poemState,
          this.p5.World.frameCount
        );
        for (let i = 0; i < renderInfo.lines.length; i++) {
          const lineNum = i + 1; // students will 1-index the lines
          // Fire line events
          this.lineEvents[lineNum]?.forEach(callback => callback());

          // Clear out line events so they don't fire again. This way, we'll fire
          // the event only on the first frame where renderInfo.lines has
          // that many items
          this.lineEvents[lineNum] = null;
        }
        this.drawFromRenderInfo(renderInfo);
        this.foregroundEffect();
      },

      // And add custom Poem Bot commands
      textConcat(text1, text2) {
        return [text1, text2].join('');
      },

      randomWord() {
        // TODO: get curated random word list from Curriculum
        const words = ['cat', 'dog', 'fish'];
        const index = this.randomNumber(0, words.length - 1);
        return words[index];
      },

      addLine(line) {
        this.poemState.lines.push(line || '');
      },

      setFontColor(color) {
        this.poemState.color = color;
      },

      setFont(font) {
        this.poemState.font = font;
      },

      setTitle(title) {
        if (title) {
          this.poemState.title = title;
        }
      },

      setAuthor(author) {
        if (author) {
          this.poemState.author = author;
        }
      },

      showPoem() {
        this.poemState.isVisible = true;
      },

      hidePoem() {
        this.poemState.isVisible = false;
      },

      setPoem(key) {
        if (key === 'wordsworth') {
          this.poemState = {
            ...this.poemState,
            title: 'I Wandered Lonely as a Cloud',
            author: 'William Wordsworth',
            lines: [
              'I wandered lonely as a cloud',
              "That floats on high o'er vales and hills,",
              'When all at once I saw a crowd,',
              'A host, of golden daffodils;',
              'Beside the lake, beneath the trees,',
              'Fluttering and dancing in the breeze.'
            ]
          };
        } else if (key === 'dickinson') {
          this.poemState = {
            ...this.poemState,
            title: 'If I can Stop one Heart from Breaking',
            author: 'Emily Dickinson',
            lines: [
              'If I can stop one heart from breaking,',
              'I shall not live in vain;',
              'If I can ease one life the aching,',
              'Or cool one pain,',
              'Or help one fainting robin',
              'Unto his nest again,',
              'I shall not live in vain.'
            ]
          };
        } else if (key === 'silverstein') {
          this.poemState = {
            ...this.poemState,
            title: 'Batty',
            author: 'Shel Silverstein',
            lines: [
              'The baby bat',
              'Screamed out in fright',
              "'Turn on the dark;",
              "I'm afraid of the light.'"
            ]
          };
        }
      },

      setTextEffect(effect) {
        this.poemState.effects.push({
          name: effect,
          duration: 100 // todo: should this be configurable on the block?
        });
      },

      whenLineShows(lineNum, callback) {
        if (!this.lineEvents[lineNum]) {
          this.lineEvents[lineNum] = [];
        }
        this.lineEvents[lineNum].push(callback);
      },

      ...backgroundEffects,
      ...foregroundEffects
    };
  }

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getScaledFontSize(text, font, desiredSize) {
    this.p5.push();
    this.p5.textFont(font);
    this.p5.textSize(desiredSize);
    const fullWidth = this.p5.textWidth(text);
    const scaledSize = Math.min(
      desiredSize,
      (desiredSize * (PLAYSPACE_SIZE - OUTER_MARGIN)) / fullWidth
    );

    this.p5.pop();
    return scaledSize;
  }

  applyEffect(renderInfo, effect, frameCount) {
    const newLines = [];
    renderInfo.lines.forEach(line => {
      const newLine = {...line};
      if (
        frameCount >= newLine.start &&
        frameCount < newLine.start + effect.duration
      ) {
        const progress = (frameCount - newLine.start) / effect.duration;
        switch (effect.name) {
          case 'fade':
            newLine.alpha = progress * 255;
            break;
          case 'typewriter': {
            const numCharsToShow = Math.floor(progress * newLine.text.length);
            newLine.text = newLine.text.substring(0, numCharsToShow);
            break;
          }
          default:
            break;
        }
      }
      newLines.push(newLine);
    });
    return {
      ...renderInfo,
      lines: newLines
    };
  }

  applyGlobalLineAnimation(renderInfo, frameCount) {
    const duration = 500;
    const progress = frameCount / duration;
    const framesPerLine = duration / renderInfo.lines.length;
    const newLines = [];
    for (let i = 0; i < renderInfo.lines.length; i++) {
      const newLine = {...renderInfo.lines[i]};
      newLine.start = (i + 1) * framesPerLine;
      newLine.end = (i + 1) * framesPerLine;
      newLines.push(newLine);
    }

    const numLinesToShow = Math.floor(progress * renderInfo.lines.length);
    return {
      ...renderInfo,
      lines: newLines.slice(0, numLinesToShow)
    };
  }

  getRenderInfo(poemState, frameCount) {
    if (!poemState.isVisible) {
      return {
        lines: []
      };
    }
    let yCursor = OUTER_MARGIN;
    let renderInfo = {
      color: poemState.color,
      font: poemState.font,
      lines: []
    };
    if (poemState.title) {
      renderInfo.title = {
        text: poemState.title,
        x: PLAYSPACE_SIZE / 2,
        y: yCursor,
        size: this.getScaledFontSize(
          poemState.title,
          poemState.font,
          FONT_SIZE * 2
        )
      };
      yCursor += LINE_HEIGHT;
    }
    if (poemState.author) {
      yCursor -= LINE_HEIGHT / 2;
      renderInfo.author = {
        text: poemState.author,
        x: PLAYSPACE_SIZE / 2,
        y: yCursor,
        size: this.getScaledFontSize(poemState.author, poemState.font, 16)
      };
      yCursor += LINE_HEIGHT;
    }
    const lineHeight = (PLAYSPACE_SIZE - yCursor) / poemState.lines.length;
    poemState.lines.forEach(line => {
      renderInfo.lines.push({
        text: line,
        x: PLAYSPACE_SIZE / 2,
        y: yCursor,
        size: this.getScaledFontSize(line, poemState.font, FONT_SIZE)
      });
      yCursor += lineHeight;
    });
    renderInfo = this.applyGlobalLineAnimation(renderInfo, frameCount);
    poemState.effects.forEach(effect => {
      renderInfo = this.applyEffect(renderInfo, effect, frameCount);
    });
    return renderInfo;
  }

  drawFromRenderInfo(renderInfo) {
    this.p5.fill(renderInfo.color || 'black');
    this.p5.textFont(renderInfo.font || 'Arial');
    if (renderInfo.title) {
      this.p5.textSize(renderInfo.title.size);
      this.p5.text(
        renderInfo.title.text,
        renderInfo.title.x,
        renderInfo.title.y
      );
    }
    if (renderInfo.author) {
      this.p5.textSize(renderInfo.author.size);
      this.p5.text(
        renderInfo.author.text,
        renderInfo.author.x,
        renderInfo.author.y
      );
    }
    renderInfo.lines.forEach(item => {
      let color = this.getP5Color(renderInfo.color || 'black', item.alpha);
      this.p5.fill(color);
      this.p5.textSize(item.size);
      this.p5.text(item.text, item.x, item.y);
    });
  }

  // polyfill for https://github.com/processing/p5.js/blob/main/src/color/p5.Color.js#L355
  getP5Color(hex, alpha) {
    let color = this.p5.color(hex);
    if (alpha !== undefined) {
      color._array[3] = alpha / color.maxes[color.mode][3];
    }
    const array = color._array;
    // (loop backwards for performance)
    const levels = (color.levels = new Array(array.length));
    for (let i = array.length - 1; i >= 0; --i) {
      levels[i] = Math.round(array[i] * 255);
    }
    return color;
  }
}
