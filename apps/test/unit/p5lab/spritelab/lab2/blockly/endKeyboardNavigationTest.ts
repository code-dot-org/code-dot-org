const mockSetIsActive = jest.fn();
jest.mock('blockly/core', () => ({
  keyboardNavigationController: {setIsActive: mockSetIsActive},
}));

import {endKeyboardNavigation} from '@cdo/apps/p5lab/spritelab/lab2/blockly/endKeyboardNavigation';

describe('endKeyboardNavigation', () => {
  it("turns off Blockly's keyboard navigation", () => {
    endKeyboardNavigation();
    expect(mockSetIsActive).toHaveBeenCalledWith(false);
  });
});
