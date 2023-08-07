import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// import from '@testing-library/jest-dom/';
// import {expect } '@testing-library/jest-dom';

// import {expect} from '../../../util/reconfiguredChai';
// import {expect} from 'chai';

import Checkbox from '@cdo/apps/componentLibrary/checkbox';
describe('Design System - Checkbox', () => {
  // beforeEach(() => {});

  it('Checkbox - loads and displays greeting', async () => {
    let isChecked = false;
    const onChange = () => (isChecked = !isChecked);

    // ARRANGE
    render(
      <Checkbox
        name="test-checkbox"
        label="Checkbox label"
        checked={isChecked}
        onChange={onChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(screen.getByRole('checkbox')).to.exist;
    // expect(screen.getByRole('checkbox', {checked: false})).to.exist;
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    console.log(checkbox);
    // expect(screen.getByRole('checkbox')).to.have.attributes('checked', );
    // expect(screen.getByRole('checkbox').getAttribute('checked')).equal('false');
    // expect(screen.getByRole('checkbox')).have.attr('checked', false);
    // to.not.h.checked;
    expect(screen.getByText('Checkbox label')).to.exist;

    await userEvent.click(screen.getByRole('checkbox'));
    // expect(screen.getByRole('checkbox').checked).to.be(true);

    // expect(screen.getByRole('checkbox').getAttribute('checked')).toBe('true');
    // expect(screen.getByRole('checkbox')).to.be.checked;
    // expect(screen.getByRole('checkbox')).toBeChecked();

    // // ACT
    // await userEvent.click(screen.getByText('Load Greeting'));
    // await screen.findByRole('heading');
    //
    // // ASSERT
    // expect(screen.getByRole('heading')).toHaveTextContent('hello there');
    // expect(screen.getByRole('button')).toBeDisabled();
  });
});
