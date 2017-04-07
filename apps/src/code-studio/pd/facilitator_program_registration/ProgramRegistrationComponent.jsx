import React from 'react';
import {ButtonList} from '../form_components/button_list.jsx';
import FieldGroup from '../form_components/FieldGroup';

export default class ProgramRegistrationComponent extends React.Component {
  constructor(props) {
    super(props);

    if (this.constructor === ProgramRegistrationComponent) {
      throw new TypeError("ProgramRegistrationComponent is an abstract class; cannot construct instances directly");
    }

    this.state = {
      data: {},
    };
  }

  handleChange(newState) {
    const data = Object.assign({}, this.state.data, newState);
    this.setState({ data });
    this.props.onChange(newState);
  }

  buildSelectFieldGroupFromOptions({name, label, required, ...props}) {
    let validationState;
    if (this.props.errors.includes(name)) {
      validationState = 'error';
    }

    return (
      <FieldGroup
        id={name}
        componentClass="select"
        label={label}
        validationState={validationState}
        onChange={this.handleChange.bind(this)}
        value={this.state.data[name] || ''}
        required={required}
      >
        {Object.keys(this.props.options[name]).map(key => (
          <option key={key} value={key}>{this.props.options[name][key]}</option>
        ))}
      </FieldGroup>
    );
  }

  buildFieldGroup({name, label, type, required, ...props}) {
    let validationState;
    if (this.props.errors.includes(name)) {
      validationState = 'error';
    }

    return (
      <FieldGroup
        id={name}
        type={type}
        label={label}
        validationState={validationState}
        onChange={this.handleChange.bind(this)}
        value={this.state.data[name] || ''}
        required={required}
        {...props}
      />
    );
  }

  buildButtonsFromOptions(name, label, type) {
    let validationState;
    if (this.props.errors.includes(name)) {
      validationState = 'error';
    }

    return (
      <ButtonList
        answers={this.props.options[name]}
        groupName={name}
        label={label}
        onChange={this.handleChange.bind(this)}
        selectedItems={this.state.data[name]}
        validationState={validationState}
        required={true}
        type={type}
      />
    );
  }
}

ProgramRegistrationComponent.propTypes = {
  options: React.PropTypes.object.isRequired,
  errors: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  onChange: React.PropTypes.func.isRequired
};
