import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {ChangeEvent, useState} from 'react';

import Toggle, {ToggleProps} from './../index';

describe('Design System - Toggle', () => {
  const renderToggle = (props: Partial<ToggleProps>) => {
    const Wrapper: React.FC = () => {
      const [checked, setChecked] = useState<boolean>(props.checked || false);
      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked);
        if (props.onChange) {
          props.onChange(e);
        }
      };

      return (
        <Toggle
          {...props}
          name="test-toggle"
          value="test-toggle"
          checked={checked}
          onChange={handleChange}
        />
      );
    };

    return render(<Wrapper />);
  };

  it('renders with correct label', () => {
    const toggleLabel = 'Toggle label';
    renderToggle({label: toggleLabel});

    const toggle = screen.getByDisplayValue<HTMLInputElement>('test-toggle');
    const label = screen.getByText(toggleLabel);

    expect(toggle).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('changes checked state on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderToggle({
      label: 'Toggle label',
      onChange: spyOnChange,
    });

    const toggle = screen.getByDisplayValue<HTMLInputElement>('test-toggle');
    expect(toggle.checked).toBe(false);

    await user.click(toggle);

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange.mock.calls[0][0].target.checked).toBe(true);
    expect(toggle.checked).toBe(true);

    await user.click(toggle);

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange.mock.calls[1][0].target.checked).toBe(false);
    expect(toggle.checked).toBe(false);
  });

  it("renders disabled toggle, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderToggle({
      label: 'Toggle label',
      disabled: true,
      onChange: spyOnChange,
    });

    const toggle = screen.getByDisplayValue<HTMLInputElement>('test-toggle');
    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(true);

    await user.click(toggle);

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(true);
  });
});
