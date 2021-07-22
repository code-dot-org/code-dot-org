import CoreLibrary from './CoreLibrary';
import {commands as backgroundEffects} from './commands/poembot/backgroundEffects';
import {commands as foregroundEffects} from './commands/poembot/foregroundEffects';

const OUTER_MARGIN = 50;
const LINE_HEIGHT = 50;
const FONT_SIZE = 25;
const TextType = {
  BLANK: 'blank',
  LITERAL: 'literal',
  RANDOM: 'random'
};
const BLANK_TEXT = {value: '', type: TextType.BLANK};
const PLAYSPACE_SIZE = 400;

export default class PoemBotLibrary extends CoreLibrary {
  constructor(p5) {
    super(p5);
    this.poem = {
      title: '',
      author: '',
      lines: []
    };
    this.isVisible = false;
    this.backgroundEffect = () => this.p5.background('white');
    this.foregroundEffect = () => {};

    this.commands = {
      // Keep everything from Core Sprite Lab
      ...this.commands,

      // Override the draw loop
      executeDrawLoopAndCallbacks() {
        this.backgroundEffect();
        this.runBehaviors();
        this.runEvents();
        this.p5.drawSprites();
        this.drawPoem();
        this.foregroundEffect();
      },

      // And add custom Poem Bot commands
      textConcat(text1, text2) {
        if (!text1) {
          return text2;
        }
        if (!text2) {
          return text1;
        }
        return [...text1, ...text2];
      },

      randomWord() {
        // TODO: get curated random word list from Curriculum
        const words = ['cat', 'dog', 'fish'];
        const index = this.randomNumber(0, words.length - 1);
        return words[index];
      },

      addLine(line) {
        this.poem.lines.push(line || [BLANK_TEXT]);
      },

      setTitle(line) {
        if (line) {
          this.poem.title = line[0].value;
        }
      },

      setAuthor(line) {
        if (line) {
          this.poem.author = line[0].value;
        }
      },

      showPoem() {
        this.isVisible = true;
      },

      hidePoem() {
        this.isVisible = false;
      },

      ...backgroundEffects,
      ...foregroundEffects
    };
  }

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  drawPoem() {
    let yCursor = OUTER_MARGIN;
    this.p5.fill('black');
    this.p5.noStroke();
    this.p5.textSize(FONT_SIZE);
    this.p5.textAlign(this.p5.CENTER);
    if (this.poem.title) {
      this.p5.textSize(FONT_SIZE * 2);
      this.p5.text(this.poem.title, PLAYSPACE_SIZE / 2, yCursor);
      this.p5.textSize(FONT_SIZE);
      yCursor += LINE_HEIGHT;
    }
    if (this.poem.author) {
      yCursor -= LINE_HEIGHT / 2;
      this.p5.textSize(16);
      this.p5.text(this.poem.author, PLAYSPACE_SIZE / 2, yCursor);
      this.p5.textSize(FONT_SIZE);
      yCursor += LINE_HEIGHT;
    }

    const lineHeight = (PLAYSPACE_SIZE - yCursor) / this.poem.lines.length;
    this.poem.lines.forEach(line => {
      this.drawPoemLine(line, yCursor);
      this.p5.textSize(FONT_SIZE);
      yCursor += lineHeight;
    });
  }

  drawPoemLine(line, yPos) {
    // Concatenate all the text values together so we can compute the length
    // of the printed text
    const fullLine = line.map(textItem => textItem.value).join(' ');
    let fullWidth = this.p5.textWidth(fullLine);
    this.p5.textSize(
      Math.min(
        FONT_SIZE,
        (FONT_SIZE * (PLAYSPACE_SIZE - OUTER_MARGIN)) / fullWidth
      )
    );

    // recompute with scaled textSize
    fullWidth = this.p5.textWidth(fullLine);

    const start = PLAYSPACE_SIZE / 2 - fullWidth / 2;
    this.p5.textAlign(this.p5.LEFT);
    let xCursor = start;
    line.forEach(textItem => {
      // TODO: Make font colors configurable by students
      if (textItem.type === 'random') {
        this.p5.fill('blue');
      } else {
        this.p5.fill('black');
      }
      this.p5.text(textItem.value, xCursor, yPos);
      xCursor += this.p5.textWidth(textItem.value + ' ');
    });
  }
}
