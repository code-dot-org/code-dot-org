import {expect} from '../../../util/configuredChai';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

describe('pegasus()', () => {
  describe('from dashboard', () => {
    stubWindowDashboard({
      CODE_ORG_URL: '//test.code.org'
    });

    it('gives an absolute pegasus url', () => {
      expect(pegasus('/relative-path')).to.equal('//test.code.org/relative-path');
    });
  });

  describe('from pegasus', () => {
    stubWindowDashboard(undefined);

    it('returns the relative URL if not', () => {
      expect(window.dashboard).to.be.undefined;
      expect(pegasus('/relative-path')).to.equal('/relative-path');
    });
  });
});

function stubWindowDashboard(value) {
  let originalDashboard;
  before(() => originalDashboard = window.dashboard);
  after(() => window.dashboard = originalDashboard);
  beforeEach(() => window.dashboard = value);
}
