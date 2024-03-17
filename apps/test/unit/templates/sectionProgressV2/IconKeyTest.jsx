import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import * as utils from '@cdo/apps/utils';
import sinon from 'sinon';
import IconKey from '@cdo/apps/templates/sectionProgressV2/IconKey';

describe('IconKey Component', () => {
  it('renders the open state initially', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('true');
    render(<IconKey isViewingValidatedLevel={false} expandedLessonIds={[]} />);
    expect(screen.getByLabelText('Icon key')).be.visible;
    expect(screen.queryByText('More Details')).be.visible;
    screen.getByText('Assignment Completion States');
    screen.getByText('Teacher Actions');
    expect(screen.queryByText('Level Types')).to.be.null;
    utils.tryGetLocalStorage.restore();
  });

  it('renders the closed state when localStorage indicates the key is closed', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('false');
    render(<IconKey isViewingValidatedLevel={false} expandedLessonIds={[]} />);
    expect(screen.queryByText('Assignment Completion States')).to.be.null;
    expect(screen.queryByText('Teacher Actions')).to.be.null;
    expect(screen.queryByText('Level Types')).to.be.null;
    utils.tryGetLocalStorage.restore();
  });

  it('expands collapses on click', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('true');
    render(<IconKey isViewingValidatedLevel={false} expandedLessonIds={[]} />);
    const containerDiv = screen.getByTestId('expandable-container');
    fireEvent.click(containerDiv);
    expect(screen.queryByText('Assignment Completion States')).to.be.null;
    expect(screen.queryByText('Teacher Actions')).to.be.null;
    expect(screen.queryByText('Level Types')).to.be.null;
    utils.tryGetLocalStorage.restore();
  });

  it('displays LevelTypesBox when viewing level progress', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('true');
    render(
      <IconKey isViewingValidatedLevel={false} expandedLessonIds={[123]} />
    );
    screen.getByText('Assignment Completion States');
    screen.getByText('Teacher Actions');
    screen.getByText('Level Types');
    utils.tryGetLocalStorage.restore();
  });

  it('displays Validated level type when viewing level with validated property', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('true');
    render(
      <IconKey isViewingValidatedLevel={true} expandedLessonIds={[123]} />
    );
    screen.getByText('Validated');
    utils.tryGetLocalStorage.restore();
  });

  it('shows pop-up when more details are clicked', () => {
    render(<IconKey isViewingValidatedLevel={false} expandedLessonIds={[]} />);
    const moreDetailsLink = screen.queryByText('More Details');
    expect(moreDetailsLink).be.visible;
    expect(screen.queryByText('Progress Tracking Icon Key')).to.be.null;
    fireEvent.click(moreDetailsLink);
    screen.getByText('Progress Tracking Icon Key');
  });
});
