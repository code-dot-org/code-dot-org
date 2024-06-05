import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon';

import Button from '@cdo/apps/componentLibrary/button/_baseButton/_BaseButton';

import {expect} from '../../util/reconfiguredChai';

describe('Design System - Button', () => {
  it('Button - renders with correct text', () => {
    render(<Button text="Button test" onClick={() => null} />);

    const button = screen.getByText('Button test');
    expect(button).to.exist;
  });

  it('Button - can be clicked', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    const onClick = () => {
      spyOnChange();
    };

    const ButtonToRender = () => (
      <Button text="Button" ariaLabel="ButtonLabel" onClick={onClick} />
    );

    // Initial render
    const {rerender} = render(<ButtonToRender />);

    let button = screen.getByLabelText('ButtonLabel');
    expect(button).to.exist;

    expect(button.disabled).to.be.false;

    await user.click(button);

    // Re-render after user's first click
    rerender(<ButtonToRender />);

    button = screen.getByLabelText('ButtonLabel');

    expect(spyOnChange).to.have.been.calledOnce;
    expect(button.disabled).to.be.false;

    await user.click(button);

    // Re-render after user's second click
    rerender(<ButtonToRender />);

    button = screen.getByLabelText('ButtonLabel');

    expect(spyOnChange).to.have.been.calledTwice;
    expect(button.disabled).to.be.false;
  });

  it("Button - renders disabled button, can't click it", async () => {
    const user = userEvent.setup();
    const spyOnClick = sinon.spy();

    const onClick = () => {
      spyOnClick();
    };

    const ButtonToRender = () => (
      <Button
        text="Button test"
        onClick={onClick}
        ariaLabel="Button aria label"
        disabled={true}
      />
    );

    // Initial render
    const {rerender} = render(<ButtonToRender />);

    let button = screen.getByLabelText('Button aria label');
    expect(button).to.exist;

    await user.click(button);

    // Re-render after user's first click
    rerender(<ButtonToRender />);

    button = screen.getByLabelText('Button aria label');

    expect(spyOnClick).to.not.have.been.called;
    expect(button.disabled).to.be.true;

    await user.click(button);

    // Re-render after user's second click
    rerender(<ButtonToRender />);

    button = screen.getByLabelText('Button aria label');

    expect(spyOnClick).to.not.have.been.called;
    expect(button.disabled).to.be.true;
  });
});
