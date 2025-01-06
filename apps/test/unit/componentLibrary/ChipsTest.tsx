import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, {useState} from 'react';
import '@testing-library/jest-dom';

import Chips, {ChipsProps} from '@cdo/apps/componentLibrary/chips';

const options = [
  {value: 'chip1', label: 'Chip1'},
  {value: 'chip2', label: 'Chip2'},
  {value: 'chip3', label: 'Chip3'},
];

describe('Design System - Chips', () => {
  const TestChips: React.FC<Partial<ChipsProps>> = props => {
    const [values, setValues] = useState<string[]>(props.values || []);

    return (
      <Chips
        name="test-chips"
        values={values}
        setValues={setValues}
        options={options}
        {...props}
      />
    );
  };

  it('renders with correct label', () => {
    render(<TestChips label="Chips label" />);

    expect(screen.getByText('Chips label')).toBeInTheDocument();
    options.forEach(({label}) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it('does not render label if it is not specified', () => {
    render(<TestChips />);

    expect(screen.queryByText('Chips label')).not.toBeInTheDocument();
    options.forEach(({label}) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it('checks chip on click', async () => {
    const user = userEvent.setup();

    render(<TestChips label="Chips label" />);

    const chip1 = screen.getByLabelText('Chip1') as HTMLInputElement;
    const chip2 = screen.getByLabelText('Chip2') as HTMLInputElement;
    const chip3 = screen.getByLabelText('Chip3') as HTMLInputElement;

    expect(chip1.checked).toBe(false);
    expect(chip2.checked).toBe(false);
    expect(chip3.checked).toBe(false);

    await user.click(chip1);

    expect(chip1.checked).toBe(true);
    expect(chip2.checked).toBe(false);
    expect(chip3.checked).toBe(false);

    await user.click(chip2);

    expect(chip1.checked).toBe(true);
    expect(chip2.checked).toBe(true);
    expect(chip3.checked).toBe(false);

    await user.click(chip1);

    expect(chip1.checked).toBe(false);
    expect(chip2.checked).toBe(true);
    expect(chip3.checked).toBe(false);
  });

  it('handles required state correctly', async () => {
    // The `required` prop for each individual _Chip (option) is determined based on the `required` prop
    // of the Chips (group):
    // - If the Chips (group) `required` prop is `false`, all _Chip (option) `required` props will also
    // be `false`.
    // - If the Chips (group) `required` prop is `true`, the _Chip (option) `required` prop will be:
    //    - `true` if none of the _Chip (options) are `checked`.
    //    - `false` if at least one of the _Chip (options) is `checked`.
    const user = userEvent.setup();

    render(
      <TestChips
        label="Chips label"
        required
        requiredMessageText="Please choose at least one option"
      />
    );

    const chip1 = screen.getByLabelText('Chip1') as HTMLInputElement;
    const chip2 = screen.getByLabelText('Chip2') as HTMLInputElement;

    expect(chip1.required).toBe(true);
    expect(chip2.required).toBe(true);

    await user.click(chip1);

    expect(chip1.required).toBe(false);
    expect(chip2.required).toBe(false);

    await user.click(chip1);

    expect(chip1.required).toBe(true);
    expect(chip2.required).toBe(true);
  });

  it('does not check chip if disabled', async () => {
    const user = userEvent.setup();

    render(<TestChips label="Chips label" disabled />);

    const chip1 = screen.getByLabelText('Chip1') as HTMLInputElement;
    const chip2 = screen.getByLabelText('Chip2') as HTMLInputElement;

    expect(chip1.disabled).toBe(true);
    expect(chip2.disabled).toBe(true);

    await user.click(chip1);

    expect(chip1.checked).toBe(false);

    await user.click(chip2);

    expect(chip2.checked).toBe(false);
  });
});
