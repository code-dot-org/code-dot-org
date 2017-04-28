/** A fake Firehose client to simplify dependencies in storybook */
class FakeFirehoseClient {
  getEnvironment() {
    return "unknown";
  }

  isTestEnvironment() {
    return false;
  }

  isDevelopmentEnvironment() {
    return false;
  }

  shouldPutRecord() {
    return false;
  }

  getAnalyticsUuid() {
    return null;
  }

  getDeviceInfo() {
    return {};
  }

  addCommonValues() {
    return {};
  }

  putRecord() { }

  putRecordBatch() { }
}

const firehoseClient = new FakeFirehoseClient();
export default firehoseClient;
