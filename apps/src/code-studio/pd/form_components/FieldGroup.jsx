import React from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup,
} from 'react-bootstrap';

const REQUIRED = (<span style={{color: 'red'}}> *</span>);

export default class FieldGroup extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const value = event.target.value;
    this.props.onChange && this.props.onChange({
      [this.props.id]: value
    });
  }

  render() {
    const {
      id,
      validationState,
      label,
      required,
      // we pull onChange out here just so it doesn't get included in ...props
      onChange, // eslint-disable-line no-unused-vars
      children,
      ...props
    } = this.props;

    return (
      <FormGroup controlId={id} validationState={validationState}>
        <ControlLabel>{label} {required && REQUIRED}</ControlLabel>
        <FormControl
          onChange={this.handleChange}
          {...props}
        >
          {children}
        </FormControl>
      </FormGroup>
    );
  }
}

FieldGroup.propTypes = {
  id: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  required: React.PropTypes.bool,
  validationState: React.PropTypes.string,
  children: React.PropTypes.arrayOf(React.PropTypes.node),
  onChange: React.PropTypes.func,
};
