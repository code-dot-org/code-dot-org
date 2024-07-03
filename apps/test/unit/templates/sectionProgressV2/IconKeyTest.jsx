import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import IconKey from '@cdo/apps/templates/sectionProgressV2/IconKey';
import * as utils from '@cdo/apps/utils';



describe('IconKey Component', () => {
  it('renders the open state initially', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('true');
    render(<IconKey />);
    expect(screen.getByLabelText('Icon Key')).be.visible;
    expect(screen.queryByText('More Details')).be.visible;
    screen.getByText('Assignment Completion States');
    screen.getByText('Teacher Actions');
    screen.getByText('Level Types');
    utils.tryGetLocalStorage.restore();
  });

  it('renders the closed state when localStorage indicates the key is closed', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('false');
    render(<IconKey />);
    expect(screen.queryByText('Assignment Completion States')).toBeNull();
    expect(screen.queryByText('Teacher Actions')).toBeNull();
    expect(screen.queryByText('Level Types')).toBeNull();
    utils.tryGetLocalStorage.restore();
  });

  it('expands collapses on click', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('true');
    render(<IconKey />);
    const containerDiv = screen.getByTestId('expandable-container');
    fireEvent.click(containerDiv);
    expect(screen.queryByText('Assignment Completion States')).toBeNull();
    expect(screen.queryByText('Teacher Actions')).toBeNull();
    expect(screen.queryByText('Level Types')).toBeNull();
    utils.tryGetLocalStorage.restore();
  });

  it('displays all icon options when open', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('true');
    render(<IconKey />);
    screen.getByText('Assignment Completion States');
    screen.getByText('Teacher Actions');
    screen.getByText('Level Types');
    utils.tryGetLocalStorage.restore();
  });

  it('shows pop-up when more details are clicked', () => {
    render(<IconKey />);
    const moreDetailsLink = screen.queryByText('More Details');
    expect(moreDetailsLink).be.visible;
    expect(screen.queryByText('Progress Tracking Icon Key')).toBeNull();
    fireEvent.click(moreDetailsLink);
    screen.getByText('Progress Tracking Icon Key');
  });
});
