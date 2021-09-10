class PlaygroundLatencyCalculator {
  constructor() {
    this.reset();
  }

  onRunStarted() {
    this.runStartedTimeMs = Date.now();
    this.firstRun = true;
  }

  onClick() {
    this.clickTimeMs = Date.now();
    this.clickReceived = true;
  }

  onUpdateReceived() {
    if (this.firstRun) {
      const now = Date.now();
      this.firstRun = false;
      console.log('------ [PLAYGROUND] ------');
      console.log(
        `\nInitial update time: ${(
          (now - this.runStartedTimeMs) /
          1000
        ).toFixed(4)}s\n`
      );
      console.log('------');
    }

    this.updateReceivedTimeMs = Date.now();
    this.updateReceived = true;
  }

  onUpdateComplete() {
    this.updateCompletedTimeMs = Date.now();
    if (this.clickReceived && this.updateReceived) {
      this.numUpdates++;

      this.publishLatency();

      this.clickReceived = false;
      this.updateReceived = false;
    }
  }

  onStopped() {
    this.reset();
  }

  publishLatency() {
    const messageLatency = this.updateReceivedTimeMs - this.clickTimeMs;
    const loadLatency = this.updateCompletedTimeMs - this.clickTimeMs;

    this.averageMessageLatency =
      (this.averageMessageLatency * (this.numUpdates - 1) + messageLatency) /
      this.numUpdates;
    this.averageLoadLatency =
      (this.averageLoadLatency * (this.numUpdates - 1) + loadLatency) /
      this.numUpdates;

    console.log('------ [PLAYGROUND] ------');
    console.log(
      `\nLast click-to-update latency: ${(messageLatency / 1000).toFixed(
        4
      )}s. \nAverage click-to-update latency: ${(
        this.averageMessageLatency / 1000
      ).toFixed(4)}s. \n\nLast click-to-render latency: ${(
        loadLatency / 1000
      ).toFixed(4)}s. \nAverage click-to-render latency: ${(
        this.averageLoadLatency / 1000
      ).toFixed(4)}s\n`
    );
    console.log('------');
  }

  reset() {
    this.firstRun = false;
    this.clickReceived = false;
    this.updateReceived = false;

    this.numUpdates = 0;

    this.runStartedTimeMs = 0;
    this.clickTimeMs = 0;
    this.updateReceivedTimeMs = 0;
    this.updateCompletedTimeMs = 0;

    this.averageMessageLatency = 0;
    this.averageLoadLatency = 0;
  }
}

const calculator = new PlaygroundLatencyCalculator();

export default calculator;
