import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import {expect} from '../../util/reconfiguredChai';

import Button from '@cdo/apps/componentLibrary/button';

describe('Design System - Button', () => {
  it('Button - renders with correct text', () => {
    render(<Button text="Button test" />);

    const button = screen.getByText('Button test');
    expect(button).to.exist;
  });

  // it('Checkbox - changes checked state on click', async () => {
  //   const user = userEvent.setup();
  //   const spyOnChange = sinon.spy();
  //
  //   let checked = false;
  //   const onChange = () => {
  //     checked = !checked;
  //     spyOnChange(checked);
  //   };
  //
  //   // Initial render
  //   const {rerender} = render(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   let checkbox = screen.getByDisplayValue('test-checkbox');
  //   expect(checkbox).to.exist;
  //
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.false;
  //   expect(checkbox.indeterminate).to.be.false;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's first click
  //   rerender(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   checkbox = screen.getByDisplayValue('test-checkbox');
  //
  //   expect(spyOnChange).to.have.been.calledOnce;
  //   expect(spyOnChange).to.have.been.calledWith(true);
  //   expect(checkbox.checked).to.be.true;
  //   expect(checkbox.disabled).to.be.false;
  //   expect(checkbox.indeterminate).to.be.false;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's second click
  //   rerender(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   checkbox = screen.getByDisplayValue('test-checkbox');
  //
  //   expect(spyOnChange).to.have.been.calledTwice;
  //   expect(spyOnChange).to.have.been.calledWith(false);
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.false;
  //   expect(checkbox.indeterminate).to.be.false;
  // });

  it("Button - renders disabled button, can't click it", async () => {
    const user = userEvent.setup();
    const spyOnClick = sinon.spy();

    const onClick = () => {
      spyOnClick();
    };

    const ButtonToRender = () => (
      <Button text="Button test" onClick={onClick} disabled={true} />
    );

    // Initial render
    const {rerender} = render(<ButtonToRender />);

    let button = screen.getByText('Button test');
    expect(button).to.exist;

    await user.click(button);

    // Re-render after user's first click
    rerender(<ButtonToRender />);

    button = screen.getByText('Button test');

    expect(spyOnClick()).to.not.have.been.called;
    expect(button.disabled).to.be.true;

    await user.click(button);

    // Re-render after user's second click
    rerender(<ButtonToRender />);

    expect(spyOnClick()).to.not.have.been.called;
    expect(button.disabled).to.be.true;
  });
});
