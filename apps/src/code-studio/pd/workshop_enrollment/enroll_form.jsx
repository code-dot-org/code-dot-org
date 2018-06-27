/*
 * Form to create a workshop enrollment
 */
import React, {PropTypes} from 'react';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../form_components/FieldGroup';
import {isEmail} from '@cdo/apps/util/formatValidation';

export default class EnrollForm extends React.Component {
  static propTypes = {
    workshop_id: PropTypes.number.isRequired,
    logged_in: PropTypes.bool,
    user_email: PropTypes.string
  };

  constructor(props) {
    super(props);

    if (this.props.user_email) {
      this.state = {
        email: this.props.user_email,
        confirmEmail: this.props.user_email
      };
    }
  }

  handleChange = (change) => {
    this.setState(change);
  };

  onRegister = () => {
    if (this.validateRequiredFields()) {
      this.submit();
    }
  };

  submit() {
    this.submitRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/workshops/${this.props.workshop_id}/enrollments`,
      contentType: 'application/json',
      data: JSON.stringify(this.state), // take out confirmEmail
      complete: () => {
        console.log('complete');
      }
    });
  }

  validateRequiredFields() {
    let errors = this.getErrors();
    let missingRequiredFields = this.requiredFields.filter(f => !this.state[f]);

    if (missingRequiredFields.length || Object.keys(errors).length) {
      console.log(errors);
      console.log(missingRequiredFields);
      return false;
    }
    return true;
  }

  render() {
    return (
      <form>
        <p>
          Fields marked with a<span className="form-required-field"> * </span>
          are required.
        </p>
        <FormGroup>
          <FieldGroup
            id="firstName"
            label="First Name"
            type="text"
            required={true}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="lastName"
            label="Last Name"
            type="text"
            required={true}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="email"
            label="Email Address"
            type="email"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.props.user_email}
          />
          {
            !this.props.logged_in &&
            <FieldGroup
              id="confirmEmail"
              label="Confirm Email Address"
              type="email"
              required={true}
              onChange={this.handleChange}
            />
          }
        </FormGroup>
        <Button
          onClick={this.onRegister}
        >
          Register
        </Button>
      </form>
    );
  }

  requiredFields = ['firstName', 'lastName', 'email'];

  getErrors() {
    let errors = {};

    if (this.state.email) {
      if (!isEmail(this.state.email)) {
        errors.email = "Must be a valid email address";
      }
      if (!this.state.logged_in && this.state.confirmEmail && this.state.email !== this.state.confirmEmail) {
        errors.confirmEmail = "Email addresses do not match";
      }
    }

    return errors;
  }
}
