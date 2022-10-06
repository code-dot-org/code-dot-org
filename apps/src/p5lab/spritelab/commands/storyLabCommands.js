import * as storyLabUtils from '@cdo/apps/p5lab/storyLabUtils';

export const commands = {
  drawStoryLabText() {
    if (this.storyLabText.heading || this.storyLabText.subHeading) {
      storyLabUtils.drawHeadings(this.p5, this.storyLabText);
    }
  },

  setHeading(heading) {
    this.storyLabText.heading = heading;
  },

  setSubheading(subHeading) {
    this.storyLabText.subHeading = subHeading;
  }
};
