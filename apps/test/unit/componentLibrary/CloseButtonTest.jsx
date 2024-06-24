import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon';

import CloseButton from '@cdo/apps/componentLibrary/closeButton';

import {expect} from '../../util/reconfiguredChai';

describe('Design System - CloseButton', () => {
  it('renders with default props', () => {
    render(<CloseButton onClick={() => {}} aria-label="default close" />);

    const button = screen.getByRole('button');
    expect(button).to.exist;
  });

  it('applies custom class name', () => {
    const className = 'custom-class';
    render(
      <CloseButton
        aria-label="custom className close"
        onClick={() => {}}
        className={className}
      />
    );

    const button = screen.getByRole('button');
    expect(button.classList.contains(className)).to.be.true;
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = sinon.spy();

    render(
      <CloseButton aria-label="Close to test onClick" onClick={handleClick} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).to.have.been.calledOnce;
  });
});
