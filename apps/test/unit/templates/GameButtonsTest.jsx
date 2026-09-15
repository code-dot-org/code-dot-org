import {Button as MuiButton} from '@mui/material';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {useSetupBlockColor} from '@cdo/apps/blockly/utils/useSetupBlockColor';
import {RunButton} from '@cdo/apps/templates/GameButtons';

jest.mock('@cdo/apps/blockly/utils/useSetupBlockColor', () => ({
  useSetupBlockColor: jest.fn(),
}));

describe('RunButton', () => {
  it('uses the design-system colors without a Blockly setup color', () => {
    useSetupBlockColor.mockReturnValue(null);
    const button = shallow(<RunButton />).find(MuiButton);
    const styles = button.prop('sx');

    expect(styles.backgroundColor).toBe(
      'var(--background-accent-orange-primary)'
    );
    expect(
      styles['&:hover, &.force-hover, &[data-force-hover="true"]']
        .backgroundColor
    ).toBe('var(--background-accent-orange-strong)');
    expect(styles.color).toBe('var(--text-neutral-white-fixed)');
  });

  it('uses the Blockly setup color with white text', () => {
    useSetupBlockColor.mockReturnValue('#FF4235');
    const button = shallow(<RunButton />).find(MuiButton);
    const styles = button.prop('sx');

    expect(styles.backgroundColor).toBe('#FF4235');
    expect(
      styles['&:hover, &.force-hover, &[data-force-hover="true"]']
        .backgroundColor
    ).toBe('rgb(224, 58, 46)');
    expect(styles.color).toBe('var(--text-neutral-white-fixed)');
  });
});
