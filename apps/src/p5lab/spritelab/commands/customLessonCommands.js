import * as coreLibrary from '../coreLibrary';

export const commands = {
  // Haiku lesson in CS connections pilot 2021
  drawHaiku() {
    const haiku = coreLibrary.screenText.haiku;
    if (!haiku) {
      return;
    }
    this.textAlign(this.CENTER, this.CENTER);
    this.stroke('white');
    this.fill('black');
    this.strokeWeight(2);
    this.textFont('Courier New');
    this.textStyle(this.BOLD);
    const defaultSize = 25;

    const scaleTextSize = (scaleMultiplier, text) => {
      const oldTextSize = this.textSize();
      this.textSize(defaultSize * scaleMultiplier);
      const size = Math.min(
        defaultSize * scaleMultiplier,
        (defaultSize * scaleMultiplier * 370) / this.textWidth(text)
      );
      this.textSize(oldTextSize);
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
