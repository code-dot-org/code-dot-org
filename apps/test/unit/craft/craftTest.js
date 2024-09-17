import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import Craft from '@cdo/apps/craft/code-connection/craft';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import pageConstants from '@cdo/apps/redux/pageConstants';

import {assert} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('Craft', () => {
  beforeAll(() => sinon.stub(Craft, 'render'));
  afterAll(() => Craft.render.restore());

  beforeEach(stubRedux);
  afterEach(restoreRedux);

  it('app init', () => {
    registerReducers({pageConstants});
    const config = {
      level: {},
      skin: {},
    };

    // Craft.init makes an API call, and if that call fails, tries to display
    // some UI that will fail to render. Avoid that by ensure our API call has
    // success
    // A better approach could be to provide a way to give Craft a mocked cc client
    const server = sinon.fakeServerWithClock.create();
    server.respondWith('GET', 'http://localhost:8080/connected', [
      200,
      {'Content-Type': 'application/json'},
      '{"foo": "bar"}',
    ]);

    Craft.init(config);
    server.respond();
    assert(getStore().getState().pageConstants.isMinecraft);
    server.restore();
  });
});
