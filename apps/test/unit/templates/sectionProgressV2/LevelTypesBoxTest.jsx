import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import LevelTypesBox from '@cdo/apps/templates/sectionProgressV2/LevelTypesBox';

describe('LevelTypesBox Component', () => {
  it('renders three options', () => {
    render(<LevelTypesBox />);
    expect(screen.getByText('Level Types')).to.exist;
    expect(screen.getByText('Choice level')).to.exist;
    expect(screen.getByText('Assessment level')).to.exist;
  });
});
