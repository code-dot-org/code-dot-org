import Button from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import 'react-select/dist/react-select.css';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import color from '@cdo/apps/util/color';

import {SelectStyleProps} from '../constants';
import ButtonList from '../form_components/ButtonList';

const ROLES = [
  'Teacher',
  'Librarian',
  'Media Specialist',
  'School Administrator',
  'District Administrator',
  'Other',
];

const ROLE_MAP = ROLES.map(v => ({value: v, text: v}));
// add friendly empty value option
ROLE_MAP.unshift({value: '', text: '-'});

const GRADE_LEVEL = ['K-5', '6-8', '9-12'];

export default class RegionalPartnerContactForm extends React.Component {
  static propTypes = {
    options: PropTypes.shape({
      user_name: PropTypes.string,
      email: PropTypes.string,
      zip: PropTypes.string,
      notes: PropTypes.string,
      grade_levels: PropTypes.array,
      role: PropTypes.string,
    }),
    apiEndpoint: PropTypes.string.isRequired,
    sourcePageId: PropTypes.string.isRequired,
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
      notes: this.props.options.notes,
      role: this.props.options.role,
      grade_levels: this.props.options.grade_levels,
    };
  }

  submit = () => {
    const params = {
      // set null or empty values to undefined so they are ignored
      name: this.state.name || undefined,
      email: this.state.email,
      zip: this.state.zip,
      notes: this.state.notes || undefined,
      source: this.props.sourcePageId,
      role: this.state.role || undefined,
      grade_levels: this.state.grade_levels || undefined,
    };

    this.setState({submitting: true});

    this.submitRequest = $.ajax({
      method: 'POST',
      url: this.props.apiEndpoint,
      contentType: 'application/json',
      data: JSON.stringify({form_data: params}),
      complete: result => {
        this.onSubmitComplete(result);
      },
    });
  };

  onInputChange = event => {
    this.setState({[event.target.name]: event.target.value});
  };

  onRoleChange = change => {
    this.setState({role: change.value});
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
          submitting: false,
        });
      }
    } else if (results.responseJSON) {
      this.setState({submitted: true, submitting: false});
      analyticsReporter.sendEvent(EVENTS.SUBMIT_RP_CONTACT_FORM_EVENT, {
        'source page id': this.props.sourcePageId,
      });
    } else {
      this.setState({submitted: false, submitting: false});
    }
  };
  render() {
    if (this.state.submitted) {
      return (
        <div
          id={`regional-partner-mini-contact-thanks-${this.props.sourcePageId}`}
          className="regional-partner-mini-contact-thanks"
        >
          Your message has been sent. Thank you. Your Regional Partner will be
          in touch.
        </div>
      );
    } else {
      return (
        <div
          id={`regional-partner-mini-contact-form-${this.props.sourcePageId}`}
          className="regional-partner-mini-contact-form"
          style={styles.form}
        >
          <div style={styles.intro}>
            Your local Code.org Regional Partner provides high quality Code.org
            professional learning to teachers, and can help guide your school or
            district on implementation, certification, funding, and more. They
            are happy to answer any questions you may have about the program!
          </div>
          <TextField
            id="name"
            name="name"
            label="Name"
            inputType="text"
            size="m"
            onChange={this.onInputChange}
            value={this.state.name}
            style={styles.inputField}
            maxLength={255}
          />
          {this.state.errors.includes('email') && (
            <div
              style={styles.error}
              id="regional-partner-mini-contact-error-email"
            >
              Please enter an email.
            </div>
          )}
          <TextField
            id="email"
            name="email"
            label="Email"
            inputType="email"
            size="m"
            errorMessage={undefined}
            onChange={this.onInputChange}
            value={this.state.email}
            style={styles.inputField}
            maxLength={255}
          />
          {this.state.errors.includes('zip') && (
            <div
              id="regional-partner-mini-contact-error-zip"
              style={styles.error}
            >
              Please enter your school ZIP Code.
            </div>
          )}
          <TextField
            id="zip"
            name="zip"
            label="School ZIP Code"
            inputType="number"
            size="m"
            onChange={this.onInputChange}
            value={this.state.zip}
            style={styles.inputField}
            maxLength={5}
          />
          <ButtonList
            groupName="grade_levels"
            label="Grade Level(s)"
            type="check"
            onChange={this.handleChange}
            answers={GRADE_LEVEL}
            required={false}
            selectedItems={this.state.grade_levels}
            style={styles.button}
            suppressLineBreak
          />
          <label>Your role</label>
          <SimpleDropdown
            id="role"
            labelText=""
            value={this.state.role}
            onChange={this.onRoleChange}
            items={ROLE_MAP}
            selectedValue=""
            {...SelectStyleProps}
            style={styles.inputField}
          />
          <TextField
            id="notes"
            label="Questions or notes for your local Regional Partner"
            type="text"
            componentClass="textarea"
            onChange={this.onInputChange}
            value={this.state.notes}
            style={styles.inputField}
          />
          {!this.state.submitting && (
            <Button id="submit" onClick={this.submit} text="Send" />
          )}
          {this.state.submitting && <span className="fa fa-spin fa-spinner" />}{' '}
        </div>
      );
    }
  }
}

const styles = {
  form: {
    display: 'flex',
    minWidth: 600,
    maxWidth: 800,
    padding: '24px 32px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
  },
  inputField: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    alignSelf: 'stretch',
  },
  error: {
    color: color.red,
  },
  intro: {
    paddingBottom: 10,
  },
  select: {
    maxWidth: 500,
  },
};
