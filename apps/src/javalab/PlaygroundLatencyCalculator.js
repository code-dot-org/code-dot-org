class PlaygroundLatencyCalculator {
  constructor() {
    this.clickReceived = false;
    this.lastClickMs = 0;
    this.averageLatency = 0;
    this.numClicks = 0;
  }

  onClick() {
    this.lastClickMs = Date.now();
    this.clickReceived = true;
  }

  onUpdateReceived() {
    if (!this.clickReceived) {
      return;
    }
    const now = Date.now();

    this.numClicks++;

    const deltaMs = now - this.lastClickMs;

    this.averageLatency =
      (this.averageLatency * (this.numClicks - 1) + deltaMs) / this.numClicks;
    console.log(
      `\n[PLAYGROUND] \nLast click-to-update latency: ${(
        deltaMs / 1000
      ).toFixed(4)}s. \nAverage click-to-update latency: ${(
        this.averageLatency / 1000
      ).toFixed(4)}s.`
    );

    this.clickReceived = false;
  }
}

const calculator = new PlaygroundLatencyCalculator();

export default calculator;
