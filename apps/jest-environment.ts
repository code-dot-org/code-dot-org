import JSDOMEnvironment from 'jest-environment-jsdom';

// https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
// This wires up some useful browser-visible modules when they are missing from
// jsdom normally.
export default class FixJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // Add URL.createObjectURL and URL.revokeObjectURL
    // This implementation is borrowed from the same basic implementations
    // as 'jsdom-worker'
    const objects: {[key: string]: Blob | MediaSource} = {};

    this.global.URL.createObjectURL = blob => {
      const id = `${Math.random()}-${Date.now()}`;
      objects[id] = blob;
      return `blob:http://localhost/${id}`;
    };

    this.global.URL.revokeObjectURL = url => {
      const m = String(url).match(/^blob:http:\/\/localhost\/(.+)$/);
      if (m) delete objects[m[1]];
    };
  }
}
