import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React, {useState, ChangeEvent} from 'react';

import TextField, {TextFieldProps} from '@cdo/apps/componentLibrary/textField';

describe('Design System - TextField', () => {
  const renderTextField = (props: Partial<TextFieldProps>) => {
    const Wrapper: React.FC = () => {
      const [value, setValue] = useState<string>(
        props.value || 'test-textfield'
      );
      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        props.onChange && props.onChange(e);
      };
      return (
        <TextField
          {...props}
          value={value}
          name="test-textfield-name"
          onChange={handleChange}
        />
      );
    };

    return render(<Wrapper />);
  };

  it('renders with correct label', () => {
    renderTextField({label: 'TextField label'});

    const textField =
      screen.getByDisplayValue<HTMLInputElement>('test-textfield');
    const label = screen.getByText('TextField label');

    expect(textField).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('changes value via keyboard input', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderTextField({label: 'TextField label', onChange: spyOnChange});

    const textField =
      screen.getByDisplayValue<HTMLInputElement>('test-textfield');

    await user.type(textField, '12');

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(textField.value).toBe('test-textfield12');
  });

  it("doesn't change value when disabled", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderTextField({
      label: 'TextField label',
      disabled: true,
      onChange: spyOnChange,
    });

    const textField =
      screen.getByDisplayValue<HTMLInputElement>('test-textfield');

    await user.type(textField, '12');

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(textField.value).toBe('test-textfield');
    expect(textField.disabled).toBe(true);
  });

  it("doesn't change value when readOnly", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderTextField({
      label: 'TextField label',
      readOnly: true,
      onChange: spyOnChange,
    });

    const textField =
      screen.getByDisplayValue<HTMLInputElement>('test-textfield');

    await user.type(textField, '12');

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(textField.value).toBe('test-textfield');
    expect(textField.readOnly).toBe(true);
  });
});
