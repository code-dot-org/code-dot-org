import {publishSetupBlockColor} from '@cdo/apps/blockly/utils/workspace/themes';
import {getStore} from '@cdo/apps/redux';
import {setSetupBlockColor} from '@cdo/apps/redux/blockly';

jest.mock('@cdo/apps/redux', () => ({
  getStore: jest.fn(),
}));

describe('publishSetupBlockColor', () => {
  let dispatch;

  const createTheme = setupColor => ({
    blockStyles: setupColor ? {setup_blocks: {colourPrimary: setupColor}} : {},
  });

  beforeEach(() => {
    dispatch = jest.fn();
    getStore.mockReturnValue({dispatch});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('publishes the setup block color', () => {
    publishSetupBlockColor(createTheme('#f46800'));

    expect(dispatch).toHaveBeenCalledWith(setSetupBlockColor('#f46800'));
  });

  it('clears the color when setup blocks have no style', () => {
    publishSetupBlockColor(createTheme());

    expect(dispatch).toHaveBeenCalledWith(setSetupBlockColor(null));
  });
});
