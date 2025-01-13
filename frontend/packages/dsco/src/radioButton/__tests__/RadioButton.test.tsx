import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ChangeEvent, useCallback, useState} from 'react';
import '@testing-library/jest-dom';

import RadioButton, {RadioButtonProps} from './../index';

describe('Design System - Radio Button', () => {
  const TestRadioButton: React.FC<Partial<RadioButtonProps>> = props => {
    const [checked, setChecked] = useState<boolean>(props.checked || false);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setChecked(prevChecked => !prevChecked); // Explicitly update state
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        props && props.onChange && props.onChange(e);
      },
      [props],
    );

    return (
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={handleChange}
        {...props}
      />
    );
  };

  it('renders with correct label', () => {
    render(<TestRadioButton />);

    const radioButton = screen.getByDisplayValue('test-radioButton');
    const label = screen.getByText('Radio Button label');

    expect(radioButton).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('selects button when clicked, remains selected if clicked again', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let checked = false;
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
      checked = !checked;
      spyOnChange(e);
    };

    const {rerender} = render(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
      />,
    );

    let radioButton = screen.getByDisplayValue(
      'test-radioButton',
    ) as HTMLInputElement;

    expect(radioButton.checked).toBe(false);
    expect(radioButton.disabled).toBe(false);

    await user.click(radioButton);

    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
      />,
    );

    radioButton = screen.getByDisplayValue(
      'test-radioButton',
    ) as HTMLInputElement;

    expect(spyOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({value: 'test-radioButton'}),
      }),
    );
    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(radioButton.checked).toBe(true);

    await user.click(radioButton);

    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
      />,
    );

    radioButton = screen.getByDisplayValue(
      'test-radioButton',
    ) as HTMLInputElement;

    // onChange is not triggered on already checked radio buttons
    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(radioButton.checked).toBe(true);
  });

  it("renders disabled radio button and doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    render(<TestRadioButton disabled={true} onChange={spyOnChange} />);

    const radioButton = screen.getByDisplayValue(
      'test-radioButton',
    ) as HTMLInputElement;

    expect(radioButton.disabled).toBe(true);
    expect(radioButton.checked).toBe(false);

    await user.click(radioButton);

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(radioButton.checked).toBe(false);
  });
});
