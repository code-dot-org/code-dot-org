import {
  setWindowLocation,
  resetWindowLocation,
  queryParams,
  updateQueryParam,
} from '@cdo/apps/code-studio/utils'; // eslint-disable-line no-restricted-imports

describe('utils', () => {
  let fakeWindowLocation = {
    search: '',
    pathname: '',
  };
  beforeAll(() => setWindowLocation(fakeWindowLocation));
  afterAll(resetWindowLocation);

  describe('queryParams', () => {
    beforeEach(() => {
      fakeWindowLocation.search = '?param1=one&param2=two';
    });

    it('can pull out a specific param from the url', () => {
      expect(queryParams('param1')).toEqual('one');
      expect(queryParams('param2')).toEqual('two');
    });

    it('get a hash of params if no specific one is asked for', () => {
      expect(queryParams()).toEqual({
        param1: 'one',
        param2: 'two',
      });
    });
  });

  describe('updateQueryParam', () => {
    let pushStateOrig = window.history.pushState;
    let replaceStateOrig = window.history.replaceState;

    let pushedLocation;
    let replacedLocation;
    beforeEach(() => {
      pushedLocation = undefined;
      replacedLocation = undefined;
      window.history.pushState = (_, __, newLocation) => {
        pushedLocation = newLocation;
      };
      window.history.replaceState = (_, __, newLocation) => {
        replacedLocation = newLocation;
      };
    });
    afterEach(() => {
      window.history.pushState = pushStateOrig;
      window.history.replaceState = replaceStateOrig;
    });

    it('can add a query param', () => {
      fakeWindowLocation.pathname = '/some/path';
      fakeWindowLocation.search = '';

      updateQueryParam('foo', 'bar');
      expect(pushedLocation).toEqual('/some/path?foo=bar');
    });

    it('can replace a query param', () => {
      fakeWindowLocation.pathName = '/some/path';
      fakeWindowLocation.search = '?param1=one&param2=two';

      updateQueryParam('param2', 'three');
      expect(pushedLocation).toEqual('/some/path?param1=one&param2=three');
    });

    it('can remove a query param', () => {
      fakeWindowLocation.pathname = '/some/path';
      fakeWindowLocation.search = '?param1=one&param2=two';

      updateQueryParam('param1', undefined);
      expect(pushedLocation).toEqual('/some/path?param2=two');
    });

    it('can use replaceState', () => {
      fakeWindowLocation.pathname = '/some/path';
      fakeWindowLocation.search = '?param1=one&param2=two';

      updateQueryParam('param1', undefined, true);
      expect(pushedLocation).toEqual(undefined);
      expect(replacedLocation).toEqual('/some/path?param2=two');
    });
  });
});
