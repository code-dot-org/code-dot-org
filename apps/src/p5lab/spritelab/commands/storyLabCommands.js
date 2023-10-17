import * as storyLabUtils from '@cdo/apps/p5lab/storyLabUtils';

export const commands = {
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

  setHeading(heading) {
    this.storyLabText.heading = heading;
  },

  setSubheading(subheading) {
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
};
