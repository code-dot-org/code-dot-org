export const commands = {
  // TODO: would it be possible to re-use the background/foreground effect code from dance party?
  setBackgroundEffect(effectName) {
    if (effectName === 'solid') {
      this.backgroundEffect = () => this.p5.background('pink');
    } else if (effectName === 'rainbow') {
      var hue = 0;
      this.p5.colorMode(this.p5.HSL, 360);
      this.backgroundEffect = () => {
        this.p5.background(hue, 200, 200);
        hue = (hue + 1) % 360;
      };
    }
  }
};
