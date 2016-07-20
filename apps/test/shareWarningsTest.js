var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocalesDEPRECATED('Applab');
testUtils.setExternalGlobals();
var ReactTestUtils = require('react-addons-test-utils');
var ReactDOM = require('react-dom');
var sinon = require('sinon');

var msg = require('@cdo/apps/locale');
var shareWarnings = require('@cdo/apps/shareWarnings');

describe('shareWarnings', function () {
  describe('checkSharedAppWarnings function', function () {

    beforeEach(() => {
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
        });
      });

      it('should render a ShareWarningsDialog dialog', () => {
        assert(ReactDOM.render.calledOnce);
      });

      it('should pass some props to the react dialog', () => {
        assert.isFalse(dialog.props.showStoreDataAlert);
        assert.isFalse(dialog.props.is13Plus);
        assert.isFunction(dialog.props.handleClose);
        assert.isFunction(dialog.props.handleTooYoung);
      });

      it('should keep track of whether the user claimed to be over 13', () => {
        assert.isFalse(dialog.props.is13Plus);
        dialog.props.handleClose();
        dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: false,
        });
        assert.isTrue(dialog.props.is13Plus);
      });
    });

    describe('options', () => {
      it('should show a data api warning if the app has data apis, but only once', () => {
        var dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: false,
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
        var dialog = checkSharedAppWarnings({
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

      it('should consider the is13Plus option to decide if the user is13Plus', () => {
        var dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: true,
          is13Plus: true,
        });
        assert.isTrue(dialog.props.is13Plus);

        dialog = checkSharedAppWarnings({
          channelId: 'some-channel',
          isSignedIn: true,
          is13Plus: false,
        });
        assert.isFalse(dialog.props.is13Plus);
      });

    });

  });
});
