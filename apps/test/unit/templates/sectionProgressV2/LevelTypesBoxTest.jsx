import {render, screen} from '@testing-library/react';
import React from 'react';

import LevelTypesBox from '@cdo/apps/templates/sectionProgressV2/LevelTypesBox';

import {expect} from '../../../util/reconfiguredChai';

describe('LevelTypesBox Component', () => {
  it('renders three options', () => {
    render(<LevelTypesBox />);
    expect(screen.getByText('Level Types')).to.exist;
    expect(screen.getByText('Choice level')).to.exist;
    expect(screen.getByText('Assessment level')).to.exist;
  });
});
