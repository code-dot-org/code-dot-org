var testUtils = require('../util/testUtils');
import {assert} from '../util/configuredChai';
var ReactDOM = require('react-dom');
var sinon = require('sinon');

var shareWarnings = require('@cdo/apps/shareWarnings');

describe('shareWarnings', function () {

  testUtils.setExternalGlobals();

  describe('checkSharedAppWarnings function', function () {

    beforeEach(() => {
      localStorage.removeItem('is13Plus');
      localStorage.removeItem('dataAlerts');
      sinon.spy(ReactDOM, 'render');
    });

    afterEach(() => {
      ReactDOM.render.restore();
    });

    function checkSharedAppWarnings(config) {
      shareWarnings.checkSharedAppWarnings(config);
      return ReactDOM.render.lastCall.args[0];
    }

    describe('basic usage', () => {
      var dialog;
      beforeEach(() => {
        dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: false,
          hasDataAPIs: () => true
        });
      });

      it('should render a ShareWarningsDialog dialog', () => {
        assert(ReactDOM.render.calledOnce);
      });

      it('should pass some props to the react dialog', () => {
        assert.isTrue(dialog.props.showStoreDataAlert);
        assert.isTrue(dialog.props.promptForAge);
        assert.isFunction(dialog.props.handleClose);
        assert.isFunction(dialog.props.handleTooYoung);
      });

      it('should keep track of whether the user claimed to be over 13', () => {
        assert.isTrue(dialog.props.promptForAge);
        dialog.props.handleClose();
        dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: false,
        });
        assert.isFalse(dialog.props.promptForAge);
      });
    });

    describe('options', () => {
      it('should not show data api warning to owners', () => {
        var dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: false,
          isOwner: true,
          hasDataAPIs: () => true,
        });
        assert.isFalse(dialog.props.showStoreDataAlert);
      });

      it('should show a data api warning if the app has data apis, but only once', () => {
        var dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: false,
          isOwner: false,
          hasDataAPIs: () => true,
        });
        assert.isTrue(dialog.props.showStoreDataAlert);
        dialog.props.handleClose();
        dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: false,
          hasDataAPIs: () => true,
        });
        assert.isFalse(dialog.props.showStoreDataAlert);
      });

      it('should call the onWarningsComplete callback if specified', () => {
        var onWarningsComplete = sinon.spy();
        checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: false,
          onWarningsComplete,
        });
        assert.isTrue(onWarningsComplete.calledOnce);
      });

      it('should call the onTooYoung callback if specified', () => {
        var onTooYoung = sinon.spy();
        var dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: false,
          onTooYoung,
        });
        assert.isFalse(onTooYoung.calledOnce);
        dialog.props.handleTooYoung();
        assert.isTrue(onTooYoung.calledOnce);
      });
    });
  });
});
