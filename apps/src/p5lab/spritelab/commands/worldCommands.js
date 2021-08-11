import {getStore} from '@cdo/apps/redux';
import {addConsoleMessage} from '../../redux/textConsole';
import {
  addTextPrompt,
  addMultipleChoicePrompt
} from '../../redux/spritelabInput';

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
      return this.getAdjustedWorldTime() || 0;
    } else if (unit === 'frames') {
      return this.p5.World.frameCount || 0;
    }
    return 0;
  },

  hideTitleScreen() {
    this.screenText = {};
  },

  printText(text) {
    this.printLog.push(text);
    getStore().dispatch(addConsoleMessage({text: text}));
  },

  setBackground(color) {
    this.setBackground(color);
  },

  // Deprecated. The new background block is setBackgroundImageAs
  setBackgroundImage(img) {
    if (this.p5._preloadedBackgrounds && this.p5._preloadedBackgrounds[img]) {
      let backgroundImage = this.p5._preloadedBackgrounds[img];
      this.setBackground(backgroundImage);
    }
  },

  setBackgroundImageAs(img) {
    if (
      this.p5._predefinedSpriteAnimations &&
      this.p5._predefinedSpriteAnimations[img]
    ) {
      let backgroundImage = this.p5._predefinedSpriteAnimations[img];
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
        choice3
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
  }
};
