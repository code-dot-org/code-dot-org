import _ from 'lodash';

import {commands as audioCommands} from '@cdo/apps/code-studio/audioApi';
import * as drawUtils from '@cdo/apps/p5lab/drawUtils';
import {getStore} from '@cdo/apps/redux';

import {isBlank} from '../../utils';
import spritelabCommands from '../spritelab/commands/index';
import CoreLibrary from '../spritelab/CoreLibrary';

import {commands as backgroundEffects} from './commands/backgroundEffects';
import {commands as behaviors} from './commands/behaviors';
import {POEMS} from './constants';

const OUTER_MARGIN = 50;
const LINE_HEIGHT = 50;
const FONT_SIZE = 25;
const PLAYSPACE_SIZE = 400;
const POEM_DURATION = 400;

export default class PoetryLibrary extends CoreLibrary {
  constructor(p5) {
    super(p5);
    // Extra information for validation code to be able to inspect the program state
    this.validationInfo = {
      endTime: POEM_DURATION * 1.25,
    };
    this.poemState = {
      ..._.cloneDeep(getStore().getState().poetry.selectedPoem),
      font: {
        fill: 'black',
        font: 'Arial',
      },
      frameType: undefined,
      text: {
        highlightColor: null,
      },
      isVisible: true,
      textEffects: [],
      // For any subtype besides poetry (time capsule or poetry hoc),
      // start the poem animation when the program starts (frame 1)
      // The animation can be restarted with the animatePoem() block, which
      // updates this value.
      // This value is used as an offset when calculating which lines to show.
      animationStartFrame:
        appOptions.level.standaloneAppName === 'poetry' ? null : 1,
      backgroundMusic: undefined,
    };
    this.backgroundEffect = () => this.p5.background('white');
    this.lineEvents = {};
    this.p5.textAlign(this.p5.CENTER);
    this.p5.angleMode(this.p5.DEGREES);
    this.p5.noStroke();

    this.commands = {
      // Keep everything from Core Sprite Lab
      ...this.commands,

      // Override the draw loop
      executeDrawLoopAndCallbacks() {
        // Make sure we start each frame with a clean slate.
        this.p5.background('white');

        this.backgroundEffect();
        this.runBehaviors();
        this.runEvents();
        this.p5.drawSprites();
        this.drawFrame();
        const renderInfo = this.getRenderInfo(
          this.poemState,
          this.p5.World.frameCount
        );
        // Don't fire line events in preview
        if (!this.isPreviewFrame()) {
          // filter non-poem-body lines (title, author, and blank lines) for line events
          const poemLines = renderInfo.lines.filter(
            line => line.isPoemBodyLine
          );
          for (let i = 0; i < poemLines.length; i++) {
            const lineNum = i + 1; // students will 1-index the lines
            if (this.lineEvents[lineNum] && !this.lineEvents[lineNum].fired) {
              // Fire line events
              this.lineEvents[lineNum].forEach(callback => callback());

              // Set fired to true so that we don't re-fire this event again.
              this.lineEvents[lineNum].fired = true;
            }
          }
        }
        this.drawFromRenderInfo(renderInfo);

        // Don't show foreground effect in preview
        if (!this.isPreviewFrame()) {
          this.foregroundEffects.forEach(effect => effect.func());
        }
      },

      // And add custom Poetry commands

      addFrame(frameType) {
        this.poemState.frameType = frameType;
      },

      destroy(costume) {
        spritelabCommands.destroy.call(this, {costume});
      },

      glideTo(costume, location) {
        spritelabCommands.glideTo.call(this, {costume}, location);
      },

      playMusic(url) {
        if (this.poemState.backgroundMusic) {
          audioCommands.stopSound({url: this.poemState.backgroundMusic});
        }
        this.poemState.backgroundMusic = url;
        this.soundLog.push(url);
        audioCommands.playSound({url, loop: true});
      },

      textConcat(text1, text2) {
        return [text1, text2].join('');
      },

      addLine(line) {
        this.poemState.lines.push(line || '');
      },

      setFontColor(fill) {
        if (fill) {
          this.poemState.font.fill = fill;
        }
      },

      setFont(font) {
        if (font) {
          this.poemState.font.font = font;
        }
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

      animateText() {
        this.poemState.animationStartFrame = this.p5.World.frameCount;
        // Reset line events since we're starting the poem animation over.
        Object.values(this.lineEvents).forEach(e => (e.fired = false));
      },

      addTextHighlight(color) {
        this.poemState.text.highlightColor = color;
      },

      showText() {
        this.poemState.isVisible = true;
      },

      hideText() {
        this.poemState.isVisible = false;
      },

      setPoem(key) {
        const poem = POEMS[key];
        if (poem) {
          this.poemState = {
            ...this.poemState,
            author: poem.author,
            title: poem.title,
            lines: [...poem.lines],
          };
        }
      },

      setTextEffect(effect) {
        this.poemState.textEffects.push({
          name: effect,
        });
      },

      whenLineShows(lineNum, callback) {
        if (!this.lineEvents[lineNum]) {
          this.lineEvents[lineNum] = [];
        }
        this.lineEvents[lineNum].push(callback);
      },

      startBehavior(costumeName, behaviorName) {
        if (behaviors[behaviorName]) {
          spritelabCommands.addBehaviorSimple.call(
            this,
            {costume: costumeName},
            {func: behaviors[behaviorName].bind(this), name: behaviorName}
          );
        }
      },

      stopBehavior(costumeName, behaviorName) {
        if (behaviorName === 'all') {
          spritelabCommands.removeAllBehaviors.call(this, {
            costume: costumeName,
          });
        } else if (behaviors[behaviorName]) {
          spritelabCommands.removeBehaviorSimple.call(
            this,
            {costume: costumeName},
            {func: behaviors[behaviorName].bind(this), name: behaviorName}
          );
        }
      },

      getValidationInfo() {
        this.validationInfo.lineEvents = Object.keys(this.lineEvents);
        this.validationInfo.font = {...this.poemState.font};
        this.validationInfo.textEffects = this.poemState.textEffects.map(
          effect => effect.name
        );
        this.validationInfo.foregroundEffects = this.foregroundEffects.map(
          effect => effect.name
        );
        this.validationInfo.highlightColor = this.poemState.text.highlightColor;
        this.validationInfo.frameType = this.poemState.frameType;
        return this.validationInfo;
      },

      setSuccessFrame() {
        if (!this.validationInfo.successFrame) {
          // Only set the success frame if it hasn't already been set (the first
          // frame at which we know the student will pass the level).
          this.validationInfo.successFrame = this.p5.frameCount;
        }
      },

      drawProgressBar() {
        this.p5.push();
        this.p5.noStroke();
        if (this.validationInfo.successFrame) {
          // The student will pass the level
          this.p5.fill(this.p5.rgb(133, 175, 76));
        } else {
          // The student will not pass the level (yet);
          this.p5.fill(this.p5.rgb(118, 102, 160));
        }
        this.p5.rect(
          0,
          390,
          (this.p5.frameCount / this.validationInfo.endTime) * PLAYSPACE_SIZE,
          10
        );
        this.p5.pop();
      },

      ...backgroundEffects,
    };
  }

  drawFrame() {
    const frameImage = this.p5._preloadedFrames[this.poemState.frameType];
    if (!frameImage) {
      return;
    }

    const frameThickness = 15;
    this.p5.push();
    this.p5.noStroke();

    // top
    this.p5.image(frameImage, 0, 0, PLAYSPACE_SIZE, frameThickness);
    // bottom
    this.p5.image(
      frameImage,
      0,
      PLAYSPACE_SIZE - frameThickness,
      PLAYSPACE_SIZE,
      frameThickness
    );

    // In p5, you can't rotate an image, you just rotate the p5 canvas.
    // right
    this.p5.translate(200, 200);
    this.p5.rotate(90);
    this.p5.translate(-200, -200);
    this.p5.image(
      frameImage,
      frameThickness,
      0,
      PLAYSPACE_SIZE - 2 * frameThickness,
      frameThickness
    );

    // left
    this.p5.translate(200, 200);
    this.p5.rotate(180);
    this.p5.translate(-200, -200);
    this.p5.image(
      frameImage,
      frameThickness,
      0,
      PLAYSPACE_SIZE - 2 * frameThickness,
      frameThickness
    );

    this.p5.pop();
  }

  getScaledFontSize(text, font, desiredSize) {
    this.p5.push();
    this.p5.textFont(font);
    this.p5.textSize(desiredSize);
    // Some authors require copyright info that is also included in the author field.
    const lines = text.split('\n');
    const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b));
    const fullWidth = this.p5.textWidth(longestLine);
    const scaledSize = Math.min(
      desiredSize,
      (desiredSize * (PLAYSPACE_SIZE - OUTER_MARGIN)) / fullWidth
    );
    // We can also cap the font height.  If it's only a single line of text
    // (say the title or author) then we cap at 30.  Otherwise, we take
    // (PLAYSPACE_SIZE / 2) and divide it by the number of lines in the poem;
    // even in this case, the cap only has an effect on particulary long poems.
    const maxLineHeight =
      lines.length === 1 ? 30 : PLAYSPACE_SIZE / 2 / lines.length;

    this.p5.pop();
    return Math.min(scaledSize, maxLineHeight);
  }

  applyTextEffect(renderInfo, effect, frameCount) {
    const newLines = [];
    renderInfo.lines.forEach(line => {
      const newLine = {...line};
      if (frameCount >= newLine.start && frameCount < newLine.end) {
        const progress =
          (frameCount - newLine.start) / (newLine.end - newLine.start);
        switch (effect.name) {
          case 'fade':
            newLine.alpha = progress * 255;
            break;
          case 'typewriter': {
            const numCharsToShow = Math.floor(progress * newLine.text.length);
            newLine.text = newLine.text.substring(0, numCharsToShow);
            break;
          }
          case 'flyLeft': {
            const start = -PLAYSPACE_SIZE / 2;
            const end = newLine.x;
            newLine.x = start - progress * (start - end);
            break;
          }
          case 'flyRight': {
            const start = PLAYSPACE_SIZE * 1.5;
            const end = newLine.x;
            newLine.x = start - progress * (start - end);
            break;
          }
          case 'flyTop': {
            const start = -LINE_HEIGHT;
            const end = newLine.y;
            newLine.y = start - progress * (start - end);
            break;
          }
          case 'flyBottom': {
            const start = PLAYSPACE_SIZE + LINE_HEIGHT;
            const end = newLine.y;
            newLine.y = start - progress * (start - end);
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
      lines: newLines,
    };
  }

  applyGlobalLineAnimation(renderInfo, frameCount) {
    if (this.poemState.animationStartFrame === null) {
      return renderInfo;
    }

    const framesPerLine = POEM_DURATION / renderInfo.lines.length;

    const newLines = [];
    for (let i = 0; i < renderInfo.lines.length; i++) {
      const newLine = {...renderInfo.lines[i]};
      newLine.start = this.poemState.animationStartFrame + i * framesPerLine;
      newLine.end =
        this.poemState.animationStartFrame + (i + 1) * framesPerLine;
      if (frameCount >= newLine.start) {
        newLines.push(newLine);
      }
    }

    return {
      ...renderInfo,
      lines: newLines,
    };
  }

  getRenderInfo(poemState, frameCount) {
    let yCursor = OUTER_MARGIN;
    let renderInfo = {
      font: {
        ...poemState.font,
      },
      lines: [],
    };

    if (!poemState.isVisible) {
      return renderInfo;
    }

    if (poemState.title) {
      renderInfo.lines.push({
        text: poemState.title,
        x: PLAYSPACE_SIZE / 2,
        y: yCursor,
        size: this.getScaledFontSize(
          poemState.title,
          poemState.font.font,
          FONT_SIZE * 2
        ),
        isPoemBodyLine: false,
      });
      yCursor += LINE_HEIGHT;
    }
    if (poemState.author) {
      yCursor -= LINE_HEIGHT / 2;
      renderInfo.lines.push({
        text: poemState.author,
        x: PLAYSPACE_SIZE / 2,
        y: yCursor,
        size: this.getScaledFontSize(poemState.author, poemState.font.font, 16),
        isPoemBodyLine: false,
      });
      yCursor += LINE_HEIGHT;
    }
    const lineHeight = (PLAYSPACE_SIZE - yCursor) / poemState.lines.length;
    const lineSize = this.getScaledFontSize(
      poemState.lines.join('\n'),
      poemState.font.font,
      FONT_SIZE
    );
    poemState.lines.forEach(line => {
      renderInfo.lines.push({
        text: line,
        x: PLAYSPACE_SIZE / 2,
        y: yCursor,
        size: lineSize,
        isPoemBodyLine: !isBlank(line), // Used to skip blank lines in animations
      });
      yCursor += lineHeight;
    });

    // Don't apply text effects / line animation for preview
    if (this.isPreviewFrame()) {
      return renderInfo;
    }

    renderInfo = this.applyGlobalLineAnimation(renderInfo, frameCount);
    poemState.textEffects.forEach(effect => {
      renderInfo = this.applyTextEffect(renderInfo, effect, frameCount);
    });
    return renderInfo;
  }

  drawFromRenderInfo(renderInfo) {
    this.p5.textFont(renderInfo.font.font);
    renderInfo.lines.forEach(item => {
      if (
        this.poemState.text.highlightColor &&
        !isBlank(item.text) // Don't highlight blank lines
      ) {
        this.drawTextHighlight(item);
      }
      let fillColor = this.getP5Color(renderInfo.font.fill, item.alpha);
      this.p5.fill(fillColor);
      this.p5.textSize(item.size);
      this.p5.text(item.text, item.x, item.y);
    });

    if (this.isPreviewFrame()) {
      // Draw line numbers in preview frame only
      this.drawLineNumbers(renderInfo);
    }
  }

  drawTextHighlight(item) {
    const padding = 2;
    const width = drawUtils.getTextWidth(this.p5, item.text, item.size);
    const height = item.size;

    this.p5.push();
    this.p5.noStroke();
    this.p5.fill(this.poemState.text.highlightColor);
    this.p5.rect(
      // By default, item.x & item.y used in text() specify the lower-left corner of the text
      item.x - width / 2 - padding, // - w / 2 to account for centered text
      item.y - height + padding,
      width + padding * 2,
      height + padding * 2
    );
    this.p5.pop();
  }

  drawLineNumbers(renderInfo) {
    this.p5.push();
    this.p5.textAlign(this.p5.LEFT);
    this.p5.stroke('white');
    this.p5.strokeWeight(2);
    this.p5.fill('black');
    this.p5.textFont('Arial');
    this.p5.textSize(16);

    let lineNum = 1;
    renderInfo.lines.forEach(item => {
      if (item.isPoemBodyLine) {
        this.p5.text(lineNum, 5, item.y);
        lineNum++;
      }
    });
    this.p5.pop();
  }
}
