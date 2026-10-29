import {playSound as playLibrarySound} from '../../../audio/sounds';
import {Animation} from '../../../sprites';
import {MAX_NUM_TEXTS} from '../constants';
import type {BackgroundImage} from '../types';

import {defineCommands} from './defineCommands';

export const commands = defineCommands({
  comment() {
    /* no-op */
  },

  drawTitle() {
    this.p5.fill('black');
    this.p5.stroke('white');
    this.p5.strokeWeight(3);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.textSize(50);
    this.p5.text(this.screenText.title ?? '', 0, 0, 400, 200);
    this.p5.textSize(35);
    this.p5.text(this.screenText.subtitle ?? '', 0, 200, 400, 200);
  },

  getTime(unit: string): number {
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

  playSound(url: string) {
    this.soundLog.push(url);
    playLibrarySound(url, false);
  },

  playSpeech(speech: string) {
    this.host.playSpeech({
      text: speech,
      gender: 'female',
      language: 'English',
    });
  },

  printText(text: unknown) {
    this.printLog.push(text);
    // the last MAX_NUM_TEXTS will be printed
    if (this.printLog.length > MAX_NUM_TEXTS) {
      this.printLog.shift();
    }
    this.host.addConsoleMessage({text: text});
  },

  setBackground(color: string) {
    this.setBackground(color);
  },

  // Deprecated. The new background block is setBackgroundImageAs
  setBackgroundImage(imageName: string) {
    if (this.preloadedBackgrounds[imageName]) {
      const backgroundImage = this.preloadedBackgrounds[imageName];
      backgroundImage.name = imageName;
      this.setBackground(backgroundImage);
    }
  },

  setBackgroundImageAs(imageName: string) {
    const entry = this.p5.predefinedAnimations?.[imageName];
    // drawBackground draws only an image.
    if (entry && !(entry instanceof Animation)) {
      const backgroundImage: BackgroundImage = entry;
      backgroundImage.name = imageName;
      this.setBackground(backgroundImage);
    }
  },

  setPrompt(
    promptText: string,
    variableName: string,
    setterCallback: (value: unknown) => void,
  ) {
    this.registerPrompt(promptText, variableName, setterCallback);
    this.host.addTextPrompt(promptText, variableName);
  },

  setPromptWithChoices(
    promptText: string,
    variableName: string,
    choice1: unknown,
    choice2: unknown,
    choice3: unknown,
    setterCallback: (value: unknown) => void,
  ) {
    this.registerPrompt(promptText, variableName, setterCallback);
    this.host.addMultipleChoicePrompt(promptText, variableName, [
      choice1,
      choice2,
      choice3,
    ]);
  },

  showTitleScreen(title?: string, subtitle?: string) {
    this.screenText = {title: title || '', subtitle: subtitle || ''};
  },

  textJoin(text1: unknown, text2: unknown): string {
    return [text1, text2].join('');
  },

  textVariableJoin(text1: unknown, text2: unknown): string {
    return [text1, text2].join('');
  },
});
