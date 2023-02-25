import {SourcesStore} from './SourcesStore';

// global singleton for registering shared modules
// maybe ProjectRegistry instead?
// is this the right way to make a singleton in typescript?
export default class Registry {
  sourcesStore: SourcesStore;

  private static _instance: Registry;

  constructor(sourcesStore: SourcesStore) {
    if (Registry._instance) {
      throw new Error('Registry instance already initialized.');
    } else {
      Registry._instance = this;
    }

    this.sourcesStore = sourcesStore;
  }

  public static getInstance(): Registry {
    return Registry._instance;
  }
}
