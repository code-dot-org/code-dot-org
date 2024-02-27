import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import IconKey from '@cdo/apps/templates/sectionProgressV2/IconKey';

describe('IconKey Component', () => {
  it('renders the collapsed state initially', () => {
    render(<IconKey isViewingValidatedLevel={false} expandedLessonIds={[]} />);
    expect(screen.getByLabelText('Icon key')).be.visible;
    expect(screen.queryByText('Assignment Completion States')).to.be.null;
    expect(screen.queryByText('Teacher Actions')).to.be.null;
    expect(screen.queryByText('Level Types')).to.be.null;
  });

  it('expands content on click', () => {
    render(<IconKey isViewingValidatedLevel={false} expandedLessonIds={[]} />);
    const containerDiv = screen.getByTestId('expandable-container');
    fireEvent.click(containerDiv);
    expect(screen.getByText('Assignment Completion States')).to.exist;
    expect(screen.getByText('Teacher Actions')).to.exist;
    expect(screen.queryByText('Level Types')).to.be.null;
  });

  it('displays LevelTypesBox when viewing level progress', () => {
    render(
      <IconKey isViewingValidatedLevel={false} expandedLessonIds={[123]} />
    );
    const containerDiv = screen.getByTestId('expandable-container');
    fireEvent.click(containerDiv);
    expect(screen.getByText('Assignment Completion States')).to.exist;
    expect(screen.getByText('Teacher Actions')).to.exist;
    expect(screen.getByText('Level Types')).to.exist;
  });

  it('displays Validated level type when viewing level with validated property', () => {
    render(
      <IconKey isViewingValidatedLevel={true} expandedLessonIds={[123]} />
    );
    const containerDiv = screen.getByTestId('expandable-container');
    fireEvent.click(containerDiv);
    expect(screen.getByText('Validated')).to.exist;
  });
});
