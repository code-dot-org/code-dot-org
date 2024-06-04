import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import sinon from 'sinon';

import TextField from '@cdo/apps/componentLibrary/textField';

import {expect} from '../../util/reconfiguredChai';

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

    expect(screen.getByDisplayValue('test-textfield')).to.exist;
    expect(screen.getByText('TextField label')).to.exist;
  });

  it('changes value via keyboard input', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    renderTextField({label: 'TextField label', onChange: spyOnChange});

    const textField = screen.getByDisplayValue('test-textfield');

    await user.type(textField, '12');

    expect(spyOnChange).to.have.been.calledTwice;
    expect(textField.value).to.equal('test-textfield12');
  });

  it("doesn't change value when disabled", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    renderTextField({
      label: 'TextField label',
      disabled: true,
      onChange: spyOnChange,
    });

    const textField = screen.getByDisplayValue('test-textfield');

    await user.type(textField, '12');

    expect(spyOnChange).not.to.have.been.called;
    expect(textField.value).to.equal('test-textfield');
    expect(textField.disabled).to.be.true;
  });

  it("doesn't change value when readOnly", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    renderTextField({
      label: 'TextField label',
      readOnly: true,
      onChange: spyOnChange,
    });

    const textField = screen.getByDisplayValue('test-textfield');

    await user.type(textField, '12');

    expect(spyOnChange).to.have.not.been.called;
    expect(textField.value).to.equal('test-textfield');
    expect(textField.readOnly).to.be.true;
  });
});
