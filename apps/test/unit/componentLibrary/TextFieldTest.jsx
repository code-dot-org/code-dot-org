import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon';

import TextField from '@cdo/apps/componentLibrary/textField';

import {expect} from '../../util/reconfiguredChai';

describe('Design System - TextField', () => {
  it('TextField - renders with correct label', () => {
    render(
      <TextField
        name="test-textField"
        value="test"
        label="TextField label"
        onChange={() => null}
      />
    );

    const textField = screen.getByDisplayValue('test');
    expect(textField).to.exist;
    expect(screen.getByText('TextField label')).to.exist;
  });

  it('TextField - changes value via keyboard input', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    let value = 'test-textfield';

    const onChange = e => {
      value = e.target.value;
      spyOnChange(value);
    };

    // Initial rendered
    const {rerender} = render(
      <TextField
        name="test-textField"
        label="TextField label"
        value={value}
        onChange={onChange}
      />
    );

    let textField = screen.getByDisplayValue(`${value}`);
    expect(textField).to.exist;

    expect(textField.value).to.equal(value);
    expect(textField.disabled).to.be.false;

    await user.click(textField);
    await user.keyboard('1');
    //
    // Re-render after user's first click
    rerender(
      <TextField
        name="test-textField"
        label="TextField label"
        value={value}
        onChange={onChange}
      />
    );

    textField = screen.getByDisplayValue(value);

    expect(textField.value).to.equal(value);
    expect(textField.disabled).to.be.false;

    await user.click(textField);
    await user.keyboard('2');

    // Re-render after user's second click
    rerender(
      <TextField
        name="test-textField"
        label="TextField label"
        value={value}
        onChange={onChange}
      />
    );

    textField = screen.getByDisplayValue(value);

    expect(spyOnChange).to.have.been.calledTwice;
    expect(spyOnChange).to.have.been.calledWith(value);
    expect(textField.value).to.equal(value);
    expect(textField.disabled).to.be.false;
  });

  // it("TextField - renders disabled checkbox, doesn't change on click", async () => {
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
  //     <TextField
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="TextField label"
  //       checked={checked}
  //       onChange={onChange}
  //       disabled={true}
  //     />
  //   );
  //
  //   let checkbox = screen.getByDisplayValue('test-checkbox');
  //   expect(checkbox).to.exist;
  //
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.true;
  //   expect(checkbox.indeterminate).to.be.false;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's first click
  //   rerender(
  //     <TextField
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="TextField label"
  //       checked={checked}
  //       onChange={onChange}
  //       disabled={true}
  //     />
  //   );
  //
  //   checkbox = screen.getByDisplayValue('test-checkbox');
  //
  //   expect(spyOnChange).to.not.have.been.called;
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.true;
  //   expect(checkbox.indeterminate).to.be.false;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's second click
  //   rerender(
  //     <TextField
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="TextField label"
  //       checked={checked}
  //       onChange={onChange}
  //       disabled={true}
  //     />
  //   );
  //
  //   expect(spyOnChange).to.not.have.been.called;
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.true;
  //   expect(checkbox.indeterminate).to.be.false;
  // });
});
