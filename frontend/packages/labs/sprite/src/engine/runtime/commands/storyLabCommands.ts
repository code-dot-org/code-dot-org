import * as storyLabUtils from '../p5lab/storyLabUtils';

import {defineCommands} from './defineCommands';

export const commands = defineCommands({
  drawStoryLabText() {
    if (this.storyLabText.heading || this.storyLabText.subheading) {
      storyLabUtils.drawHeadings(this.p5, this.storyLabText);
    }
  },

  clearHeadings() {
    this.storyLabText = {
      heading: '',
      subheading: '',
    };
  },

  setHeading(heading: string) {
    this.storyLabText.heading = heading;
  },

  setSubheading(subheading: string) {
    this.storyLabText.subheading = subheading;
  },

  getHeading() {
    return this.storyLabText.heading;
  },

  getSubheading() {
    return this.storyLabText.subheading;
  },

  getStoryLabText() {
    return this.storyLabText;
  },
});
