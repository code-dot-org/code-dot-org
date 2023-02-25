import {Source} from './types';
import * as sourcesApi from './sourcesApi';

// TODO: is "store" the right word here?
// TODO: implementations don't have state, so these could be static or just types
export interface SourcesStore {
  load: (key: string) => Promise<Source>;

  save: (key: string, source: Source) => Promise<Response>;
}

export class LocalSourcesStore implements SourcesStore {
  load(key: string) {
    // TODO: is empty string an appropriate fallback?
    return Promise.resolve({source: localStorage.getItem(key) || ''});
  }

  save(key: string, source: Source) {
    localStorage.setItem(key, source.toString());
    // TODO: should the response contain something?
    return Promise.resolve(new Response());
  }
}

export class S3SourcesStore implements SourcesStore {
  load(channelId: string) {
    return sourcesApi.get(channelId);
  }

  save(channelId: string, source: Source) {
    return sourcesApi.put(channelId, source);
  }
}
