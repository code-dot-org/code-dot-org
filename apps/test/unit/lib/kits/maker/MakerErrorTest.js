/** @file Tests for our MakerError classes */
import MakerError, {
  ConnectionFailedError,
  wrapKnownMakerErrors,
} from '@cdo/apps/lib/kits/maker/MakerError';



describe('MakerError', () => {
  describe('wrapKnownMakerErrors(originalError)', () => {
    it(`returns the original error if it's not a known common maker error`, () => {
      const testError = new Error('Some test error.');
      const returnedError = wrapKnownMakerErrors(testError);
      expect(returnedError).toBe(testError)
        .and.not.toBeInstanceOf(MakerError);
    });

    it(`returns a ConnectionFailedError on a johnny-five timeout error`, () => {
      const j5TimeoutMessage =
        'A timeout occurred while connecting to the Board.' +
        '\n\nSomething something error stuff.';
      const testError = new Error(j5TimeoutMessage);
      const returnedError = wrapKnownMakerErrors(testError);
      expect(returnedError).toBeInstanceOf(MakerError)
        .and.toBeInstanceOf(ConnectionFailedError)
        .and.toHaveProperty('reason', j5TimeoutMessage)
        .and.not.toBe(testError);
    });
  });
});
