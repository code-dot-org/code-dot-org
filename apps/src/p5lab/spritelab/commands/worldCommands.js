import {commands as audioCommands} from '@cdo/apps/code-studio/audioApi';
import {getStore} from '@cdo/apps/redux';

import {
  addTextPrompt,
  addMultipleChoicePrompt,
} from '../../redux/spritelabInput';
import {addConsoleMessage} from '../../redux/textConsole';
import {MAX_NUM_TEXTS} from '../constants';

export const commands = {
  comment(text) {
    /* no-op */
  },

  drawTitle() {
    this.p5.fill('black');
    this.p5.stroke('white');
    this.p5.strokeWeight(3);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.textSize(50);
    this.p5.text(this.screenText.title, 0, 0, 400, 200);
    this.p5.textSize(35);
    this.p5.text(this.screenText.subtitle, 0, 200, 400, 200);
  },

  getTime(unit) {
    if (unit === 'seconds') {
      return this.getUnpausedWorldTime() - this.timerResetTime.seconds || 0;
    } else if (unit === 'frames') {
      return this.p5.World.frameCount - this.timerResetTime.frames || 0;
    }
    return 0;
  },

  resetTimer() {
    this.timerResetTime.seconds = this.getUnpausedWorldTime();
    this.timerResetTime.frames = this.currentFrame();
  },

  hideTitleScreen() {
    this.screenText = {};
  },

  playSound(url) {
    this.soundLog.push(url);
    audioCommands.playSound({url, loop: false});
  },

  playSpeech(speech) {
    audioCommands.playSpeech({
      text: speech,
      gender: 'female',
      language: 'English',
    });
  },

  printText(text) {
    this.printLog.push(text);
    // the last MAX_NUM_TEXTS will be printed
    if (this.printLog.length > MAX_NUM_TEXTS) {
      this.printLog.shift();
    }
    getStore().dispatch(addConsoleMessage({text: text}));
  },

  setBackground(color) {
    this.setBackground(color);
  },

  // Deprecated. The new background block is setBackgroundImageAs
  setBackgroundImage(imageName) {
    if (
      this.p5._preloadedBackgrounds &&
      this.p5._preloadedBackgrounds[imageName]
    ) {
      let backgroundImage = this.p5._preloadedBackgrounds[imageName];
      backgroundImage.name = imageName;
      this.setBackground(backgroundImage);
    }
  },

  setBackgroundImageAs(imageName) {
    if (
      this.p5._predefinedSpriteAnimations &&
      this.p5._predefinedSpriteAnimations[imageName]
    ) {
      let backgroundImage = this.p5._predefinedSpriteAnimations[imageName];
      backgroundImage.name = imageName;
      this.setBackground(backgroundImage);
    }
  },

  setPrompt(promptText, variableName, setterCallback) {
    this.registerPrompt(promptText, variableName, setterCallback);
    getStore().dispatch(addTextPrompt(promptText, variableName));
  },

  setPromptWithChoices(
    promptText,
    variableName,
    choice1,
    choice2,
    choice3,
    setterCallback
  ) {
    this.registerPrompt(promptText, variableName, setterCallback);
    getStore().dispatch(
      addMultipleChoicePrompt(promptText, variableName, [
        choice1,
        choice2,
        choice3,
      ])
    );
  },

  showTitleScreen(title, subtitle) {
    this.screenText = {title: title || '', subtitle: subtitle || ''};
  },

  textJoin(text1, text2) {
    return [text1, text2].join('');
  },

  textVariableJoin(text1, text2) {
    return [text1, text2].join('');
  },
};
