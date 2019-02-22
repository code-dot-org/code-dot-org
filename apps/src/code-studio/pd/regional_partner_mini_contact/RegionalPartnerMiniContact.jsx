import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../form_components/FieldGroup';
import color from '@cdo/apps/util/color';

const styles = {
  error: {
    color: color.red
  }
};

export default class RegionalPartnerMiniContact extends React.Component {
  static propTypes = {
    options: PropTypes.shape({
      user_name: PropTypes.string,
      email: PropTypes.string,
      zip: PropTypes.string,
      notes: PropTypes.string
    }),
    apiEndpoint: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      submitted: false,
      errors: [],
      name: this.props.options.user_name,
      email: this.props.options.email,
      zip: this.props.options.zip,
      notes: this.props.options.notes
    };
  }

  submit = () => {
    const params = {
      name: this.state.name,
      email: this.state.email,
      zip: this.state.zip,
      notes: this.state.notes
    };

    this.setState({submitting: true});

    this.submitRequest = $.ajax({
      method: 'POST',
      url: this.props.apiEndpoint,
      contentType: 'application/json',
      data: JSON.stringify({form_data: params}),
      complete: result => {
        this.onSubmitComplete(result);
      }
    });
  };

  handleChange = change => {
    this.setState(change);
  };

  onSubmitComplete = results => {
    if (
      results.responseJSON &&
      results.responseJSON.errors &&
      results.responseJSON.errors.form_data
    ) {
      if (results.responseJSON.errors.form_data) {
        this.setState({
          errors: results.responseJSON.errors.form_data,
          submitting: false
        });
      }
    } else if (results.responseJSON) {
      this.setState({submitted: true, submitting: false});
    } else {
      this.setState({submitted: false, submitting: false});
    }
  };

  render() {
    if (this.state.submitted) {
      return (
        <div>Your message has been sent. Thank you. We'll be in touch.</div>
      );
    } else {
      return (
        <FormGroup>
          <p>
            If you're interested in Professional Learning, just fill out this
            form and a local Regional Partner will be in touch!
          </p>
          <FieldGroup
            id="name"
            label="Name"
            type="text"
            onChange={this.handleChange}
            defaultValue={this.state.name}
          />
          {this.state.errors.includes('email') && (
            <div style={styles.error}>Please enter an email.</div>
          )}
          <FieldGroup
            id="email"
            label="Email"
            type="text"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.state.email}
          />
          {this.state.errors.includes('zip') && (
            <div style={styles.error}>Please enter a ZIP code.</div>
          )}
          <FieldGroup
            id="zip"
            label="Zip"
            type="text"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.state.zip}
          />
          <FieldGroup
            id="notes"
            label="Questions or notes for your local Regional Partner"
            type="text"
            componentClass="textarea"
            onChange={this.handleChange}
            defaultValue={this.state.notes}
          />
          {!this.state.submitting && (
            <Button id="submit" onClick={this.submit}>
              Send
            </Button>
          )}
          {this.state.submitting && <span className="fa fa-spin fa-spinner" />}{' '}
        </FormGroup>
      );
    }
  }
}
