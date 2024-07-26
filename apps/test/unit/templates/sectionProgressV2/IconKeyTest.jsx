import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import IconKey from '@cdo/apps/templates/sectionProgressV2/IconKey';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('IconKey Component', () => {
  it('renders the open state initially', () => {
    jest.spyOn(utils, 'tryGetLocalStorage').mockClear().mockReturnValue('true');
    render(<IconKey />);
    expect(screen.getByLabelText('Icon Key')).be.visible;
    expect(screen.queryByText('More Details')).be.visible;
    screen.getByText('Assignment Completion States');
    screen.getByText('Teacher Actions');
    screen.getByText('Level Types');
    utils.tryGetLocalStorage.mockRestore();
  });

  it('renders the closed state when localStorage indicates the key is closed', () => {
    jest
      .spyOn(utils, 'tryGetLocalStorage')
      .mockClear()
      .mockReturnValue('false');
    render(<IconKey />);
    expect(screen.queryByText('Assignment Completion States')).to.be.null;
    expect(screen.queryByText('Teacher Actions')).to.be.null;
    expect(screen.queryByText('Level Types')).to.be.null;
    utils.tryGetLocalStorage.mockRestore();
  });

  it('expands collapses on click', () => {
    jest.spyOn(utils, 'tryGetLocalStorage').mockClear().mockReturnValue('true');
    render(<IconKey />);
    const containerDiv = screen.getByTestId('expandable-container');
    fireEvent.click(containerDiv);
    expect(screen.queryByText('Assignment Completion States')).to.be.null;
    expect(screen.queryByText('Teacher Actions')).to.be.null;
    expect(screen.queryByText('Level Types')).to.be.null;
    utils.tryGetLocalStorage.mockRestore();
  });

  it('displays all icon options when open', () => {
    jest.spyOn(utils, 'tryGetLocalStorage').mockClear().mockReturnValue('true');
    render(<IconKey />);
    screen.getByText('Assignment Completion States');
    screen.getByText('Teacher Actions');
    screen.getByText('Level Types');
    utils.tryGetLocalStorage.mockRestore();
  });

  it('shows pop-up when more details are clicked', () => {
    render(<IconKey />);
    const moreDetailsLink = screen.queryByText('More Details');
    expect(moreDetailsLink).be.visible;
    expect(screen.queryByText('Progress Tracking Icon Key')).to.be.null;
    fireEvent.click(moreDetailsLink);
    screen.getByText('Progress Tracking Icon Key');
  });
});
