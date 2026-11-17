import {
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
  it('reads the reply limit from DCDO, as a number or numeric text', () => {
    setDcdo({[REPLY_LIMIT_FLAG]: 3});
    expect(chatThresholds()).toEqual({replyLimit: 3});
    setDcdo({[REPLY_LIMIT_FLAG]: '6'});
    expect(chatThresholds()).toEqual({replyLimit: 6});
  });

  it('falls back to 8 when the flag is unset or not a positive whole number', () => {
    setDcdo({});
    expect(chatThresholds()).toEqual({replyLimit: 8});
    setDcdo({[REPLY_LIMIT_FLAG]: 0});
    expect(chatThresholds()).toEqual({replyLimit: 8});
    setDcdo({[REPLY_LIMIT_FLAG]: 2.5});
    expect(chatThresholds()).toEqual({replyLimit: 8});
  });
});
