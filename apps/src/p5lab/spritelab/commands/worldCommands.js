import * as coreLibrary from '../coreLibrary';
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
    this.fill('black');
    this.stroke('white');
    this.strokeWeight(3);
    this.textAlign(this.CENTER, this.CENTER);
    this.textSize(50);
    this.text(coreLibrary.screenText.title, 0, 0, 400, 200);
    this.textSize(35);
    this.text(coreLibrary.screenText.subtitle, 0, 200, 400, 200);
  },

  getTime(unit) {
    if (unit === 'seconds') {
      return coreLibrary.getAdjustedWorldTime(this) || 0;
    } else if (unit === 'frames') {
      return this.World.frameCount || 0;
    }
    return 0;
  },

  hideTitleScreen() {
    coreLibrary.screenText = {};
  },

  printText(text) {
    coreLibrary.printLog.push(text);
    getStore().dispatch(addConsoleMessage({text: text}));
  },

  setBackground(color) {
    coreLibrary.background = color;
  },

  // Deprecated. The new background block is setBackgroundImageAs
  setBackgroundImage(img) {
    if (this._preloadedBackgrounds && this._preloadedBackgrounds[img]) {
      let backgroundImage = this._preloadedBackgrounds[img];
      coreLibrary.background = backgroundImage;
    }
  },

  setBackgroundImageAs(img) {
    if (
      this._predefinedSpriteAnimations &&
      this._predefinedSpriteAnimations[img]
    ) {
      let backgroundImage = this._predefinedSpriteAnimations[img];
      coreLibrary.background = backgroundImage;
    }
  },

  setPrompt(promptText, variableName, setterCallback) {
    coreLibrary.registerPrompt(promptText, variableName, setterCallback);
    getStore().dispatch(addTextPrompt(promptText, variableName));
  },

  setPromptWithChoices(promptText, variableName, choices, setterCallback) {
    coreLibrary.registerPrompt(promptText, variableName, setterCallback);
    getStore().dispatch(
      addMultipleChoicePrompt(promptText, variableName, choices)
    );
  },

  showTitleScreen(title, subtitle) {
    coreLibrary.screenText = {title: title || '', subtitle: subtitle || ''};
  },

  textJoin(text1, text2) {
    return [text1, text2].join('');
  }
};
