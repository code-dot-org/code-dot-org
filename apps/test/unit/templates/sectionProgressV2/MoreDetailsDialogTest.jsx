import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import MoreDetailsDialog from '@cdo/apps/templates/sectionProgressV2/MoreDetailsDialog';
import sinon from 'sinon';

describe('MoreDetailsDialog', () => {
  const onCloseMock = sinon.spy();

  it('renders the dialog with required elements', () => {
    render(<MoreDetailsDialog hasValidation={true} onClose={onCloseMock} />);

    expect(screen.getByText('Progress Tracking Icon Key')).be.visible;
    expect(screen.getByRole('button')).be.visible;
    expect(screen.getByText('Assignment Completion States')).be.visible;
    expect(screen.getByText('Teacher Actions')).be.visible;
    expect(screen.getByText('Level Types')).be.visible;
  });

  it('calls onClose when the close button is clicked', () => {
    render(<MoreDetailsDialog hasValidation={false} onClose={onCloseMock} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onCloseMock).to.have.been.calledOnce;
  });

  it('conditionally renders the validated item based on hasValidation prop', () => {
    const {rerender} = render(
      <MoreDetailsDialog hasValidation={false} onClose={onCloseMock} />
    );
    expect(screen.queryByText('Validated')).not.be.visible;

    rerender(<MoreDetailsDialog hasValidation={true} onClose={onCloseMock} />);
    expect(screen.queryByText('Validated')).be.visible;
  });
});
