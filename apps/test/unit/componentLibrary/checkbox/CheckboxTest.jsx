import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';

import {expect} from '../../../util/reconfiguredChai';

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

  it('Checkbox - changes checked state on click', () => {
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

    fireEvent.click(checkbox);
    expect(checkbox.checked).to.be.true;
    fireEvent.click(checkbox);
    expect(checkbox.checked).to.be.false;
  });

  it('Checkbox - renders indeterminate checkbox, changes on click', () => {
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
    expect(checkbox.indeterminate).to.be.true;

    fireEvent.click(checkbox);
    expect(checkbox.checked).to.be.true;
    expect(checkbox.indeterminate).to.be.false;
    fireEvent.click(checkbox);
    expect(checkbox.checked).to.be.false;
    expect(checkbox.indeterminate).to.be.false;
  });
});
