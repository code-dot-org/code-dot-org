/** @file Tests for our MakerError classes */
import {expect} from '../../../../util/deprecatedChai';
import MakerError, {
  ConnectionFailedError,
  wrapKnownMakerErrors
} from '@cdo/apps/lib/kits/maker/MakerError';

describe('MakerError', () => {
  describe('wrapKnownMakerErrors(originalError)', () => {
    it(`returns the original error if it's not a known common maker error`, () => {
      const testError = new Error('Some test error.');
      const returnedError = wrapKnownMakerErrors(testError);
      expect(returnedError)
        .to.equal(testError)
        .and.not.to.be.an.instanceOf(MakerError);
    });

    it(`returns a ConnectionFailedError on a johnny-five timeout error`, () => {
      const j5TimeoutMessage =
        'A timeout occurred while connecting to the Board.' +
        '\n\nSomething something error stuff.';
      const testError = new Error(j5TimeoutMessage);
      const returnedError = wrapKnownMakerErrors(testError);
      expect(returnedError)
        .to.be.an.instanceOf(MakerError)
        .and.to.be.an.instanceOf(ConnectionFailedError)
        .and.to.have.property('reason', j5TimeoutMessage)
        .and.not.to.equal(testError);
    });
  });
});
