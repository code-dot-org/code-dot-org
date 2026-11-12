import DCDO from '@cdo/apps/dcdo';
import {
  timeoutMsFromDcdo,
  timeoutMsFromDcdoSeconds,
} from '@cdo/apps/util/dcdoTimeout';

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));

const mockDcdoGet = DCDO.get as jest.Mock;

describe('timeoutMsFromDcdo', () => {
  it('uses a number as milliseconds', () => {
    mockDcdoGet.mockReturnValue(45_000);

    expect(timeoutMsFromDcdo('some-timeout-ms', 30_000)).toBe(45_000);
    expect(mockDcdoGet).toHaveBeenCalledWith('some-timeout-ms', 30_000);
  });

  it.each([
    ['45000', 45_000],
    [' 2500.5 ', 2_500.5],
  ])('reads numeric text %p', (value, expected) => {
    mockDcdoGet.mockReturnValue(value);

    expect(timeoutMsFromDcdo('some-timeout-ms', 30_000)).toBe(expected);
  });

  it('uses the default when the flag is unset', () => {
    mockDcdoGet.mockImplementation((_flag, defaultValue) => defaultValue);

    expect(timeoutMsFromDcdo('some-timeout-ms', 30_000)).toBe(30_000);
  });

  // DCDO stores arbitrary JSON.
  it.each([null, true, false, '', 'abc', '0', 0, -1, NaN, Infinity])(
    'uses the default for %p',
    value => {
      mockDcdoGet.mockReturnValue(value);

      expect(timeoutMsFromDcdo('some-timeout-ms', 30_000)).toBe(30_000);
    }
  );
});

describe('timeoutMsFromDcdoSeconds', () => {
  it.each([
    [45, 45_000],
    [2.5, 2_500],
    ['45', 45_000],
  ])('converts %p seconds to milliseconds', (value, expected) => {
    mockDcdoGet.mockReturnValue(value);

    expect(timeoutMsFromDcdoSeconds('some-timeout-seconds', 30)).toBe(expected);
    expect(mockDcdoGet).toHaveBeenCalledWith('some-timeout-seconds', 30);
  });

  it.each([undefined, true, 'abc', 0])('converts the default for %p', value => {
    mockDcdoGet.mockImplementation((_flag, defaultValue) =>
      value === undefined ? defaultValue : value
    );

    expect(timeoutMsFromDcdoSeconds('some-timeout-seconds', 30)).toBe(30_000);
  });
});
