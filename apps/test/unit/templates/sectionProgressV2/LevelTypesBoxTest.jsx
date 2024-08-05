import {render, screen} from '@testing-library/react';
import React from 'react';

import LevelTypesBox from '@cdo/apps/templates/sectionProgressV2/LevelTypesBox';

describe('LevelTypesBox Component', () => {
  it('renders three options', () => {
    render(<LevelTypesBox />);
    expect(screen.getByText('Level Types')).toBeDefined();
    expect(screen.getByText('Choice level')).toBeDefined();
    expect(screen.getByText('Assessment level')).toBeDefined();
  });
});
