import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import Craft from '@cdo/apps/craft/code-connection/craft';
import SimpleCraft from '@cdo/apps/craft/simple/craft';
import {
  registerReducers,
  stubRedux,
  restoreRedux,
  getStore,
} from '@cdo/apps/redux';
import pageConstants from '@cdo/apps/redux/pageConstants';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import currentUser from '@cdo/apps/templates/currentUserRedux';

import {TestResults} from '../../../src/constants';
import {assert} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

jest.mock('@cdo/apps/blockly/utils', () => ({
  getCode: jest.fn().mockReturnValue(''),
  getCodeBlocks: jest.fn().mockReturnValue([]),
}));

describe('Test Craft on freeplay levels', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({currentUser});
    SimpleCraft.initialConfig = {level: {freePlay: true, id: 'test-level'}};
    SimpleCraft.gameController = {getScreenshot: jest.fn()};
    global.Blockly = {};
    jest
      .spyOn(studioApp(), 'getTestResults')
      .mockReturnValue(TestResults.ALL_PASS);
    jest.spyOn(studioApp(), 'report').mockImplementation();
    jest.spyOn(studioApp(), 'displayFeedback').mockImplementation();
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
    SimpleCraft.initialConfig = undefined;
    delete global.Blockly;
  });

  it('calls studioApp().report() to save progress', () => {
    SimpleCraft.reportResult(true, true);
    expect(studioApp().report).toHaveBeenCalledTimes(1);
  });

  it('does not show the completed level dialog when suppressDialog is true', () => {
    SimpleCraft.reportResult(true, true);
    const {onComplete} = studioApp().report.mock.calls[0][0];
    onComplete({});
    expect(studioApp().displayFeedback).not.toHaveBeenCalled();
  });

  it('shows the completed level dialog when suppressDialog is false', () => {
    SimpleCraft.reportResult(true, false);
    const {onComplete} = studioApp().report.mock.calls[0][0];
    onComplete({});
    expect(studioApp().displayFeedback).toHaveBeenCalledTimes(1);
  });
});

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
