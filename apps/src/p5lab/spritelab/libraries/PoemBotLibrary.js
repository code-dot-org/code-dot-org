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
      isVisible: true
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
        for (let i = 0; i < renderInfo.textItems.length; i++) {
          // Fire line events
          this.lineEvents[i]?.forEach(callback => callback());

          // Clear out line events so they don't fire again. This way, we'll fire
          // the event only on the first frame where renderInfo.textItems has
          // that many items
          this.lineEvents[i] = null;
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

  getScaledFontSize(text, desiredSize) {
    this.p5.push();
    this.p5.textSize(desiredSize);
    const fullWidth = this.p5.textWidth(text);
    const scaledSize = Math.min(
      desiredSize,
      (desiredSize * (PLAYSPACE_SIZE - OUTER_MARGIN)) / fullWidth
    );

    this.p5.pop();
    return scaledSize;
  }

  getRenderInfo(poemState, frameCount) {
    if (!poemState.isVisible) {
      return {
        textItems: []
      };
    }
    let textItems = [];
    let yCursor = OUTER_MARGIN;
    if (poemState.title) {
      textItems.push({
        text: poemState.title,
        x: PLAYSPACE_SIZE / 2,
        y: yCursor,
        size: this.getScaledFontSize(poemState.title, FONT_SIZE * 2)
      });
      yCursor += LINE_HEIGHT;
    }
    if (poemState.author) {
      yCursor -= LINE_HEIGHT / 2;
      textItems.push({
        text: poemState.author,
        x: PLAYSPACE_SIZE / 2,
        y: yCursor,
        size: this.getScaledFontSize(poemState.author, 16)
      });
      yCursor += LINE_HEIGHT;
    }
    const lineHeight = (PLAYSPACE_SIZE - yCursor) / poemState.lines.length;
    poemState.lines.forEach(line => {
      textItems.push({
        text: line,
        x: PLAYSPACE_SIZE / 2,
        y: yCursor,
        size: this.getScaledFontSize(line, FONT_SIZE)
      });
      yCursor += lineHeight;
    });
    return {
      color: poemState.color,
      font: poemState.font,
      textItems: textItems
    };
  }

  drawFromRenderInfo(renderInfo) {
    this.p5.fill(renderInfo.color || 'black');
    this.p5.textFont(renderInfo.font || 'Arial');
    renderInfo.textItems.forEach(item => {
      this.p5.textSize(item.size);
      this.p5.text(item.text, item.x, item.y);
    });
  }
}
