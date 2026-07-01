import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState, ChangeEvent} from 'react';
import {vi} from 'vitest';

import TextField, {TextFieldProps} from './../index';

describe('Design System - TextField', () => {
  const renderTextField = (props: Partial<TextFieldProps>) => {
    const Wrapper: React.FC = () => {
      const [value, setValue] = useState<TextFieldProps['value']>(
        props.value || 'test-textfield',
      );
      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        if (props.onChange) {
          props?.onChange(e);
        }
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
    const spyOnChange = vi.fn();

    renderTextField({label: 'TextField label', onChange: spyOnChange});

    const textField =
      screen.getByDisplayValue<HTMLInputElement>('test-textfield');

    await user.type(textField, '12');

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(textField.value).toBe('test-textfield12');
  });

  it("doesn't change value when disabled", async () => {
    const user = userEvent.setup();
    const spyOnChange = vi.fn();

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
    const spyOnChange = vi.fn();

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

  it('wires the error message to the input for screen readers', () => {
    renderTextField({
      label: 'Email',
      errorMessage: 'That email is already in use.',
    });

    const input = screen.getByDisplayValue<HTMLInputElement>('test-textfield');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    // aria-describedby points at the element that holds the error text.
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const errorEl = document.getElementById(describedBy as string);
    expect(errorEl).toHaveTextContent('That email is already in use.');
  });

  it('is not marked invalid without an error message', () => {
    renderTextField({label: 'Email'});
    const input = screen.getByDisplayValue<HTMLInputElement>('test-textfield');
    // No error → no forced invalid state and nothing described.
    expect(input.getAttribute('aria-invalid')).not.toBe('true');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('merges a caller-supplied aria-describedby with the error id', () => {
    renderTextField({
      label: 'Email',
      errorMessage: 'Required.',
      ['aria-describedby']: 'hint-1',
    });
    const input = screen.getByDisplayValue<HTMLInputElement>('test-textfield');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    // Both the error element and the caller's hint are referenced.
    expect(describedBy.split(' ')).toContain('hint-1');
    const errorId = describedBy.split(' ').find(x => x !== 'hint-1');
    expect(document.getElementById(errorId as string)).toHaveTextContent(
      'Required.',
    );
  });
});
