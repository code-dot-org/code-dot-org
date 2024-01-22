import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import {expect} from '../../util/reconfiguredChai';

import Checkbox from '@cdo/apps/componentLibrary/checkbox';
describe('Design System - Checkbox', () => {
  it('Checkbox - renders with correct label', () => {
    render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
      />
    );

    const checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).to.exist;
    expect(screen.getByText('Checkbox label')).to.exist;
  });

  it('Checkbox - changes checked state on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
      />
    );

    let checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).to.exist;

    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);

    // Re-render after user's first click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).to.have.been.calledOnce;
    expect(spyOnChange).to.have.been.calledWith(true);
    expect(checkbox.checked).to.be.true;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);

    // Re-render after user's second click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).to.have.been.calledTwice;
    expect(spyOnChange).to.have.been.calledWith(false);
    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;
  });

  it('Checkbox - renders indeterminate checkbox, changes on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    let checked = false;
    let indeterminate = true;
    const onChange = () => {
      if (indeterminate) {
        // Default browser behavior for clicking an indeterminate checkbox.
        indeterminate = false;
        checked = true;
      } else {
        checked = !checked;
      }
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        indeterminate={indeterminate}
      />
    );

    let checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).to.exist;

    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.true;

    await user.click(checkbox);

    // Re-render after user's first click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        indeterminate={indeterminate}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).to.have.been.calledOnce;
    expect(spyOnChange).to.have.been.calledWith(true);
    expect(checkbox.checked).to.be.true;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);

    // Re-render after user's second click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        indeterminate={indeterminate}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).to.have.been.calledTwice;
    expect(spyOnChange).to.have.been.calledWith(false);
    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;
  });

  it("Checkbox - renders disabled checkbox, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    let checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).to.exist;

    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.true;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);

    // Re-render after user's first click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).to.not.have.been.called;
    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.true;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);

    // Re-render after user's second click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    expect(spyOnChange).to.not.have.been.called;
    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.true;
    expect(checkbox.indeterminate).to.be.false;
  });
});
