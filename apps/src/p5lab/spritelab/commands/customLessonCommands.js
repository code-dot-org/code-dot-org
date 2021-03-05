import * as coreLibrary from '../coreLibrary';

export const commands = {
  // Haiku lesson in CS connections pilot 2021
  drawHaiku() {
    const haiku = coreLibrary.screenText.haiku;
    if (!haiku) {
      return;
    }
    // Start a new drawing layer so changing things like stroke, fill, etc won't overwrite existing values
    this.push();
    this.textAlign(this.CENTER, this.CENTER);
    this.stroke('white');
    this.fill('black');
    this.strokeWeight(2);
    this.textFont('Courier New');
    this.textStyle(this.BOLD);
    const defaultSize = 25;

    // Compute how much space the given text would take up at the specified size
    const computeTextWidth = (text, size) => {
      this.push();
      this.textSize(size);
      const width = this.textWidth(text);
      this.pop();
      return width;
    };

    // Computes the right size for the specified text based on the desired scale
    // multiplier, scaled down to fit on the screen if necessary.
    const scaleTextSize = (scaleMultiplier, text) => {
      const desiredSize = defaultSize * scaleMultiplier;
      // The playspace is 400x400. We should leave a slight margin on either side,
      // so the available width for each line of text is 370.
      const availableWidth = 370;
      const size = Math.min(
        desiredSize,
        (desiredSize * availableWidth) / computeTextWidth(text, desiredSize)
      );
      return size;
    };

    this.textSize(scaleTextSize(1.6, haiku.title));
    this.text(haiku.title, 200, 75);

    this.textSize(scaleTextSize(0.8, haiku.author));
    this.text(haiku.author, 200, 115);

    this.textSize(scaleTextSize(1, haiku.line1));
    this.text(haiku.line1, 200, 175);
    this.textSize(scaleTextSize(1, haiku.line2));
    this.text(haiku.line2, 200, 225);
    this.textSize(scaleTextSize(1, haiku.line3));
    this.text(haiku.line3, 200, 275);

    // Restore the original drawing layer
    this.pop();
  },

  getHaiku() {
    return coreLibrary.screenText.haiku;
  },

  hideHaiku() {
    coreLibrary.screenText = {};
  },

  printHaiku(title, author, line1, line2, line3) {
    coreLibrary.screenText = {
      haiku: {title, author, line1, line2, line3}
    };
  }
};
