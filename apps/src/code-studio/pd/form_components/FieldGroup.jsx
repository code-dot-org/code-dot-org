import React from 'react';
import PropTypes from 'prop-types';
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
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  validationState: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node),
  onChange: PropTypes.func,
};
