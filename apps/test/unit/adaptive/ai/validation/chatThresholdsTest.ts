import {
  EFFORT_CHECK_FLAG,
  REPLY_LIMIT_FLAG,
  chatThresholds,
} from '@cdo/apps/adaptive/ai/validation/chatThresholds';
import DCDO from '@cdo/apps/dcdo';

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));
const mockGet = DCDO.get as jest.Mock;

const setDcdo = (values: {[flag: string]: unknown}) =>
  mockGet.mockImplementation((flag: string) => values[flag]);

describe('chatThresholds', () => {
  it('reads both counts from DCDO, as a number or numeric text', () => {
    setDcdo({[EFFORT_CHECK_FLAG]: 2, [REPLY_LIMIT_FLAG]: '6'});
    expect(chatThresholds()).toEqual({effortCheckAt: 2, replyLimit: 6});
  });

  it('falls back to 4 and 8 when a flag is unset or not a positive whole number', () => {
    setDcdo({});
    expect(chatThresholds()).toEqual({effortCheckAt: 4, replyLimit: 8});
    setDcdo({[EFFORT_CHECK_FLAG]: 0, [REPLY_LIMIT_FLAG]: 2.5});
    expect(chatThresholds()).toEqual({effortCheckAt: 4, replyLimit: 8});
  });
});
