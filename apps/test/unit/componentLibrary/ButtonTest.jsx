import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon';

import _BaseButton from '@cdo/apps/componentLibrary/button/_baseButton/_BaseButton';

import {expect} from '../../util/reconfiguredChai';

describe('Design System - _BaseButton', () => {
  it('_BaseButton - renders with correct text', () => {
    render(<_BaseButton text="_BaseButton test" onClick={() => null} />);

    const button = screen.getByText('_BaseButton test');
    expect(button).to.exist;
  });

  it('_BaseButton - can be clicked', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    const onClick = () => {
      spyOnChange();
    };

    const _BaseButtonToRender = () => (
      <_BaseButton
        text="_BaseButton"
        ariaLabel="_BaseButtonLabel"
        onClick={onClick}
      />
    );

    // Initial render
    const {rerender} = render(<_BaseButtonToRender />);

    let button = screen.getByLabelText('_BaseButtonLabel');
    expect(button).to.exist;

    expect(button.disabled).to.be.false;

    await user.click(button);

    // Re-render after user's first click
    rerender(<_BaseButtonToRender />);

    button = screen.getByLabelText('_BaseButtonLabel');

    expect(spyOnChange).to.have.been.calledOnce;
    expect(button.disabled).to.be.false;

    await user.click(button);

    // Re-render after user's second click
    rerender(<_BaseButtonToRender />);

    button = screen.getByLabelText('_BaseButtonLabel');

    expect(spyOnChange).to.have.been.calledTwice;
    expect(button.disabled).to.be.false;
  });

  it("_BaseButton - renders disabled button, can't click it", async () => {
    const user = userEvent.setup();
    const spyOnClick = sinon.spy();

    const onClick = () => {
      spyOnClick();
    };

    const _BaseButtonToRender = () => (
      <_BaseButton
        text="_BaseButton test"
        onClick={onClick}
        ariaLabel="_BaseButton aria label"
        disabled={true}
      />
    );

    // Initial render
    const {rerender} = render(<_BaseButtonToRender />);

    let button = screen.getByLabelText('_BaseButton aria label');
    expect(button).to.exist;

    await user.click(button);

    // Re-render after user's first click
    rerender(<_BaseButtonToRender />);

    button = screen.getByLabelText('_BaseButton aria label');

    expect(spyOnClick).to.not.have.been.called;
    expect(button.disabled).to.be.true;

    await user.click(button);

    // Re-render after user's second click
    rerender(<_BaseButtonToRender />);

    button = screen.getByLabelText('_BaseButton aria label');

    expect(spyOnClick).to.not.have.been.called;
    expect(button.disabled).to.be.true;
  });
});
