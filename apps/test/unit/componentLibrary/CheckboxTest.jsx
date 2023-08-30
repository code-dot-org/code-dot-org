import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

    render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
      />
    );

    const checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).to.exist;

    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);
    expect(checkbox.checked).to.be.true;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);
    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;
  });

  it('Checkbox - renders indeterminate checkbox, changes on click', async () => {
    const user = userEvent.setup();

    render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        indeterminate={true}
      />
    );

    const checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).to.exist;

    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.true;

    await user.click(checkbox);
    expect(checkbox.checked).to.be.true;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);
    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.false;
    expect(checkbox.indeterminate).to.be.false;
  });

  it("Checkbox - renders disabled checkbox, doesn't change on click", async () => {
    const user = userEvent.setup();

    render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        disabled={true}
      />
    );

    const checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).to.exist;

    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.true;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);
    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.true;
    expect(checkbox.indeterminate).to.be.false;

    await user.click(checkbox);
    expect(checkbox.checked).to.be.false;
    expect(checkbox.disabled).to.be.true;
    expect(checkbox.indeterminate).to.be.false;
  });
});
