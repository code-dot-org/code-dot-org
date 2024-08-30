import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import TextField from '@cdo/apps/componentLibrary/textField';

describe('Design System - TextField', () => {
  const renderTextField = props => {
    const Wrapper = () => {
      const [value, setValue] = useState(props.value || 'test-textfield');
      const handleChange = e => {
        setValue(e.target.value);
        props.onChange && props.onChange(e);
      };
      return <TextField {...props} value={value} onChange={handleChange} />;
    };

    Wrapper.propTypes = {
      value: PropTypes.string,
      onChange: PropTypes.func,
    };
    return render(<Wrapper />);
  };

  it('renders with correct label', () => {
    renderTextField({label: 'TextField label'});

    expect(screen.getByDisplayValue('test-textfield')).toBeDefined();
    expect(screen.getByText('TextField label')).toBeDefined();
  });

  it('changes value via keyboard input', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderTextField({label: 'TextField label', onChange: spyOnChange});

    const textField = screen.getByDisplayValue('test-textfield');

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

    const textField = screen.getByDisplayValue('test-textfield');

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

    const textField = screen.getByDisplayValue('test-textfield');

    await user.type(textField, '12');

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(textField.value).toBe('test-textfield');
    expect(textField.readOnly).toBe(true);
  });
});
