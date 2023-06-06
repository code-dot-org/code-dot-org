import {isUnsupportedBrowser, isIE11} from '@cdo/apps/util/browser-detector';
import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';

describe('Browser Detector', () => {
  let userAgentStub;
  let appVersionStub;

  beforeEach(() => {
    userAgentStub = sinon.stub(navigator, 'userAgent');
    appVersionStub = sinon.stub(navigator, 'appVersion');
  });

  afterEach(() => {
    userAgentStub.restore();
    appVersionStub.restore();
  });

  describe('IE', () => {
    const IE7 = 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)';
    const IE8 =
      'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)';
    const IE9 =
      'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';
    const IE10 =
      'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)';
    const IE11 =
      'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko';

    let MSInputMethodContextOriginal;
    let documentModeOriginal;

    beforeEach(() => {
      MSInputMethodContextOriginal = window.MSInputMethodContext;
      documentModeOriginal = document.documentMode;
    });

    afterEach(() => {
      window.MSInputMethodContext = MSInputMethodContextOriginal;
      document.documentMode = documentModeOriginal;
    });

    function stubIE11() {
      window.MSInputMethodContext = true;
      document.documentMode = true;
    }

    it('Detects unsupported IE versions', () => {
      // IE 7 (not supported)
      userAgentStub.value(IE7);
      expect(isUnsupportedBrowser()).to.be.true;

      // IE 8 (not supported)
      userAgentStub.value(IE8);
      expect(isUnsupportedBrowser()).to.be.true;

      // IE 9 (not supported)
      userAgentStub.value(IE9);
      expect(isUnsupportedBrowser()).to.be.true;

      // IE 10 (not supported)
      userAgentStub.value(IE10);
      expect(isUnsupportedBrowser()).to.be.true;

      // IE 11 (supported)
      stubIE11();
      userAgentStub.value(IE11);
      expect(isUnsupportedBrowser()).to.be.false;
    });

    it('Detects if browser is IE11', () => {
      userAgentStub.value(IE9);
      expect(isIE11()).to.be.false;

      stubIE11();
      userAgentStub.value(IE11);
      expect(isIE11()).to.be.true;
    });
  });

  describe('Chrome', () => {
    it('Detects unsupported Chrome versions', () => {
      // Chrome < 33 (not supported)
      userAgentStub.value(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.0.0 Safari/537.36'
      );
      expect(isUnsupportedBrowser()).to.be.true;

      // Chrome > 33 (supported)
      userAgentStub.value(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      );
      expect(isUnsupportedBrowser()).to.be.false;
    });
  });

  describe('Safari', () => {
    it('Detects unsupported Safari versions', () => {
      // Safari < 7 (not supported)
      userAgentStub.value(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/6.0.3 Safari/605.1.15'
      );
      expect(isUnsupportedBrowser()).to.be.true;

      // Safari > 7 (supported)
      userAgentStub.value(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15'
      );
      expect(isUnsupportedBrowser()).to.be.false;
    });
  });

  describe('Firefox', () => {
    it('Detects unsupported Firefox versions', () => {
      // Firefox < 25 (not supported)
      userAgentStub.value(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:70.0) Gecko/20100101 Firefox/22.0'
      );
      expect(isUnsupportedBrowser()).to.be.true;
    });

    // Firefox > 25 (supported)
    userAgentStub.value(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:70.0) Gecko/20100101 Firefox/70.0'
    );
    expect(isUnsupportedBrowser()).to.be.false;
  });
});
