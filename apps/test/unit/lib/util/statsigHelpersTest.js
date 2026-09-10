import cookies from 'js-cookie';
import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  findOrCreateStableId,
  formatUserId,
  stripStableIdParam,
} from '@cdo/apps/metrics/statsigHelpers';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('StatsigReporter', () => {
  describe('stripStableIdParam', () => {
    let replaceStateStub;
    const originalLocation = window.location;

    beforeEach(() => {
      replaceStateStub = stub(window.history, 'replaceState');
    });

    afterEach(() => {
      replaceStateStub.restore();
      if (window.location !== originalLocation) {
        delete window.location;
        window.location = originalLocation;
      }
    });

    it('removes statsig_stable_id from URL and preserves other params', () => {
      delete window.location;
      window.location = new URL(
        'http://localhost/?statsig_stable_id=550e8400-e29b-41d4-a716-446655440000&other=foo'
      );
      stripStableIdParam();
      expect(replaceStateStub.calledOnce).to.be.true;
      const newUrl = replaceStateStub.firstCall.args[2];
      expect(newUrl).to.include('other=foo');
      expect(newUrl).to.not.include('statsig_stable_id');
    });

    it('removes entire query string when statsig_stable_id is the only param', () => {
      delete window.location;
      window.location = new URL(
        'http://localhost/path?statsig_stable_id=550e8400-e29b-41d4-a716-446655440000'
      );
      stripStableIdParam();
      expect(replaceStateStub.calledOnce).to.be.true;
      const newUrl = replaceStateStub.firstCall.args[2];
      expect(newUrl).to.not.include('?');
      expect(newUrl).to.include('/path');
    });

    it('does nothing when statsig_stable_id is not in URL', () => {
      delete window.location;
      window.location = new URL('http://localhost/page?other=bar');
      stripStableIdParam();
      expect(replaceStateStub.called).to.be.false;
    });
  });

  describe('findOrCreateStableId with cross-domain param', () => {
    const paramUuid = '550e8400-e29b-41d4-a716-446655440000';
    let scriptEl;

    beforeEach(() => {
      // Simulate the data attribute emitted by Rails
      scriptEl = document.createElement('script');
      scriptEl.dataset.statsigParamId = paramUuid;
      document.head.appendChild(scriptEl);
      // Stub replaceState to avoid side effects from stripStableIdParam
      stub(window.history, 'replaceState');
      // Enable consent so cookies.set is called
      window.OnetrustActiveGroups = ',C0002,';
    });

    afterEach(() => {
      scriptEl.remove();
      window.history.replaceState.restore();
      cookies.remove('statsig_stable_id', {path: '/', domain: '.code.org'});
      localStorage.removeItem('STATSIG_STABLE_ID');
      delete window.OnetrustActiveGroups;
    });

    it('returns the param value when data attribute is present', () => {
      const result = findOrCreateStableId();
      expect(result).to.equal(paramUuid);
    });

    it('prefers the data attribute over an existing cookie', () => {
      // Set a cookie without domain restriction so jsdom can read it
      cookies.set('statsig_stable_id', 'old-cookie-value');
      const result = findOrCreateStableId();
      expect(result).to.equal(paramUuid);
    });
  });

  describe('formatUserId', () => {
    it('prepends environment in test', () => {
      stub(utils, 'getEnvironment').returns('test');
      expect(formatUserId('0').startsWith('test')).to.be.true;
      utils.getEnvironment.restore();
    });

    it('does not prepend environment in production', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(formatUserId('0').startsWith('prod')).to.be.false;
      utils.isProductionEnvironment.restore();
    });

    it('formats short user ids to be five character', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(formatUserId('1')).to.equal('00001');
      utils.isProductionEnvironment.restore();
    });

    it('does not change long user ids in production', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(formatUserId('88888')).to.equal('88888');
      utils.isProductionEnvironment.restore();
    });
  });
});
