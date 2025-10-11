import {forEveryBooleanPermutation} from '../util/testUtils';

describe('forEveryBooleanPermutation', function () {
  it('invokes a function with no arguments once', function () {
    let invocationCount = 0;
    forEveryBooleanPermutation(() => {
      invocationCount++;
    });
    expect(invocationCount).toBe(1);
  });

  it('invokes a function with one argument twice, once with true and once with false', function () {
    let expectedInvocations = [[false], [true]];
    forEveryBooleanPermutation(a => {
      expect([a]).toEqual(expectedInvocations[0]);
      expectedInvocations.shift();
    });
    expect(expectedInvocations).toHaveLength(0);
  });

  it('invokes a function with two arguments four times...', function () {
    let expectedInvocations = [
      [false, false],
      [false, true],
      [true, false],
      [true, true],
    ];
    forEveryBooleanPermutation((a, b) => {
      expect([a, b]).toEqual(expectedInvocations[0]);
      expectedInvocations.shift();
    });
    expect(expectedInvocations).toHaveLength(0);
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
      [true, true, true],
    ];
    forEveryBooleanPermutation((a, b, c) => {
      expect([a, b, c]).toEqual(expectedInvocations[0]);
      expectedInvocations.shift();
    });
    expect(expectedInvocations).toHaveLength(0);
  });
});
