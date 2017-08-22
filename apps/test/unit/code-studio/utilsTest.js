import { assert } from 'chai';
import {
  setWindowLocation,
  resetWindowLocation,
  queryParams,
  updateQueryParam
} from '@cdo/apps/code-studio/utils';

describe('utils', () => {
  let fakeWindowLocation = {
    search: '',
    pathname: ''
  };
  before(() => setWindowLocation(fakeWindowLocation));
  after(resetWindowLocation);

  describe('queryParams', () => {
    beforeEach(() => {
      fakeWindowLocation.search='?param1=one&param2=two';
    });

    it('can pull out a specific param from the url', () => {
      assert.equal(queryParams('param1'), 'one');
      assert.equal(queryParams('param2'), 'two');
    });

    it('get a hash of params if no specific one is asked for', () => {
      assert.deepEqual(queryParams(), {
        param1: 'one',
        param2: 'two'
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
      assert.equal(pushedLocation, '/some/path?foo=bar');
    });

    it('can replace a query param', () => {
      fakeWindowLocation.pathName = '/some/path';
      fakeWindowLocation.search = '?param1=one&param2=two';

      updateQueryParam('param2', 'three');
      assert.equal(pushedLocation, '/some/path?param1=one&param2=three');
    });

    it('can remove a query param', () => {
      fakeWindowLocation.pathname = '/some/path';
      fakeWindowLocation.search = '?param1=one&param2=two';

      updateQueryParam('param1', undefined);
      assert.equal(pushedLocation, '/some/path?param2=two');
    });

    it('can use replaceState', () => {
      fakeWindowLocation.pathname = '/some/path';
      fakeWindowLocation.search = '?param1=one&param2=two';

      updateQueryParam('param1', undefined, true);
      assert.equal(pushedLocation, undefined);
      assert.equal(replacedLocation, '/some/path?param2=two');
    });
  });
});
