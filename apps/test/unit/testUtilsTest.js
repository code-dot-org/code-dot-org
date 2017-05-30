/** @file Who watches the watchers? */
import {expect} from '../util/configuredChai';
import {
  forEveryBooleanPermutation,
  throwOnConsoleErrors,
  throwOnConsoleWarnings
} from '../util/testUtils';

describe('forEveryBooleanPermutation', function () {
  it('invokes a function with no arguments once', function () {
    let invocationCount = 0;
    forEveryBooleanPermutation(() => {
      invocationCount++;
    });
    expect(invocationCount).to.equal(1);
  });

  it('invokes a function with one argument twice, once with true and once with false', function () {
    let expectedInvocations = [
      [false],
      [true]
    ];
    forEveryBooleanPermutation((a) => {
      expect([a]).to.deep.equal(expectedInvocations[0]);
      expectedInvocations.shift();
    });
    expect(expectedInvocations).to.be.empty;
  });

  it('invokes a function with two arguments four times...', function () {
    let expectedInvocations = [
      [false, false],
      [false, true],
      [true, false],
      [true, true]
    ];
    forEveryBooleanPermutation((a, b) => {
      expect([a, b]).to.deep.equal(expectedInvocations[0]);
      expectedInvocations.shift();
    });
    expect(expectedInvocations).to.be.empty;
  });

  it('invokes a function with three arguments eight times...', function () {
    let expectedInvocations = [
      [false, false, false],
      [false, false, true],
      [false, true, false],
      [false, true, true],
      [true, false, false],
      [true, false, true],
      [true, true, false],
      [true, true, true]
    ];
    forEveryBooleanPermutation((a, b, c) => {
      expect([a, b, c]).to.deep.equal(expectedInvocations[0]);
      expectedInvocations.shift();
    });
    expect(expectedInvocations).to.be.empty;
  });
});

describe('throwOnConsoleErrors', function () {
  describe('without it', function () {
    it('console.error does not throw an exception', function () {
      expect(() => console.error('This console.error call is intentional.'))
          .not.to.throw();
    });
  });

  describe('with it', function () {
    throwOnConsoleErrors();
    it('console.error does throw an exception', function () {
      // We would expect this to throw an error in the after section if left
      // in place. Though this test is largely usless at this point, you could
      // validate expected behavior by uncommenting the following line and seeing
      // your test fail
      // console.error('should throw');
    });
  });
});

describe('throwOnConsoleWarnings', function () {
  describe('without it', function () {
    it('console.warn does not throw an exception', function () {
      expect(() => console.warn('This console.warn call is intentional.'))
        .not.to.throw();
    });
  });

  describe('with it', function () {
    throwOnConsoleWarnings();
    it('console.warn does throw an exception', function () {
      // We would expect this to throw an error in the after section if left
      // in place. Though this test is largely usless at this point, you could
      // validate expected behavior by uncommenting the following line and seeing
      // your test fail
      // console.warn('should throw');
    });
  });
});
