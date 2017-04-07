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

  getValidationState(name) {
    if (this.props.errors.includes(name)) {
      return 'error';
    }
  }

  buildSelectFieldGroupFromOptions({name, label, required, ...props}) {
    return (
      <FieldGroup
        id={name}
        componentClass="select"
        label={label}
        validationState={this.getValidationState(name)}
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
    return (
      <FieldGroup
        id={name}
        type={type}
        label={label}
        validationState={this.getValidationState(name)}
        onChange={this.handleChange.bind(this)}
        value={this.state.data[name] || ''}
        required={required}
        {...props}
      />
    );
  }

  buildButtonsFromOptions({name, label, type}) {
    return (
      <ButtonList
        answers={this.props.options[name]}
        groupName={name}
        label={label}
        onChange={this.handleChange.bind(this)}
        selectedItems={this.state.data[name]}
        validationState={this.getValidationState(name)}
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
