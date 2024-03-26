import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import MoreDetailsDialog from '@cdo/apps/templates/sectionProgressV2/MoreDetailsDialog';

import {expect} from '../../../util/reconfiguredChai';

describe('MoreDetailsDialog', () => {
  it('renders the dialog with required elements', () => {
    render(<MoreDetailsDialog hasValidation={true} onClose={() => {}} />);

    expect(screen.getByText('Progress Tracking Icon Key')).be.visible;
    expect(screen.getByRole('button')).be.visible;
    expect(screen.getByText('Assignment Completion States')).be.visible;
    expect(screen.getByText('Teacher Actions')).be.visible;
    expect(screen.getByText('Level Types')).be.visible;
  });

  it('calls onClose when the close button is clicked', () => {
    const onCloseMock = sinon.spy();
    render(<MoreDetailsDialog hasValidation={false} onClose={onCloseMock} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onCloseMock).to.have.been.calledOnce;
  });

  it('conditionally renders the validated item based on hasValidation prop', () => {
    const {rerender} = render(
      <MoreDetailsDialog hasValidation={false} onClose={() => {}} />
    );
    expect(screen.queryByText('Validated')).not.be.visible;

    rerender(<MoreDetailsDialog hasValidation={true} onClose={() => {}} />);
    expect(screen.queryByText('Validated')).be.visible;
  });
});
