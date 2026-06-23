import {enableUserAddedSelectionContext} from '@codebridge/utils/aiTutorUtils';

describe('enableUserAddedSelectionContext', () => {
  it('enables user-added selection context for Web Lab 2', () => {
    expect(enableUserAddedSelectionContext('weblab2')).toBe(true);
  });

  it('enables user-added selection context for Python Lab', () => {
    expect(enableUserAddedSelectionContext('pythonlab')).toBe(true);
  });

  it('does not enable user-added selection context for other labs', () => {
    expect(enableUserAddedSelectionContext('spritelab')).toBe(false);
  });
});
