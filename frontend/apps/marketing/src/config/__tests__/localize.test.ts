import {Brand} from '@/config/brand';

import {getLocalizePath, getProjectId} from '../localize';

describe('getLocalizePath', () => {
  it('should return the default LocalizeJS path when no version is provided', () => {
    const path = getLocalizePath();
    expect(path).toBe('https://global.localizecdn.com/localize.js');
  });

  it('should return the LocalizeJS path with the specified version', () => {
    const version = 123;
    const path = getLocalizePath(version);
    expect(path).toBe(`https://global.localizecdn.com/localize.${version}.js`);
  });
});

describe('getProjectId', () => {
  it('should return the correct project ID for Brand.CODE_DOT_ORG', () => {
    const projectId = getProjectId(Brand.CODE_DOT_ORG);
    expect(projectId).toBe('ttv8iUlCkVIPo');
  });
});
