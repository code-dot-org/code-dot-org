import PropTypes from 'prop-types';
import React from 'react';
import {Modal, FormGroup, Button, ControlLabel} from 'react-bootstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {SelectStyleProps} from '../constants';
import FieldGroup from '../form_components/FieldGroup';
import ButtonList from '../form_components/ButtonList';
import color from '@cdo/apps/util/color';

const styles = {
  error: {
    color: color.red
  },
  miniContactContainer: {
    backgroundColor: color.lightest_cyan,
    padding: 20,
    borderRadius: 10,
    textAlign: 'left'
  },
  modalHeader: {
    padding: '0 15px 0 0',
    height: 30,
    borderBottom: 'none'
  },
  modalBody: {
    padding: '0 15px 15px 15px',
    fontSize: 14,
    lineHeight: '22px'
  },
  intro: {
    paddingBottom: 10
  },
  select: {
    maxWidth: 500
  }
};

const ROLES = [
  'Teacher',
  'Librarian',
  'Media Specialist',
  'School Administrator',
  'District Administrator',
  'Other'
];

const ROLE_MAP = ROLES.map(v => ({value: v, label: v}));
// add friendly empty value option
ROLE_MAP.unshift({value: '', label: '-'});

const GRADE_LEVEL = ['K-5', '6-8', '9-12'];

export class RegionalPartnerMiniContact extends React.Component {
  static propTypes = {
    options: PropTypes.shape({
      user_name: PropTypes.string,
      email: PropTypes.string,
      zip: PropTypes.string,
      notes: PropTypes.string,
      grade_levels: PropTypes.array,
      role: PropTypes.string
    }),
    apiEndpoint: PropTypes.string.isRequired,
    sourcePageId: PropTypes.string.isRequired
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
      grade_levels: this.props.options.grade_levels
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
      grade_levels: this.state.grade_levels || undefined
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
        <FormGroup
          id={`regional-partner-mini-contact-form-${this.props.sourcePageId}`}
          className="regional-partner-mini-contact-form"
        >
          <div style={styles.intro}>
            Your local Code.org Regional Partner provides high quality Code.org
            professional learning to teachers, and can help guide your school or
            district on implementation, certification, funding, and more. They
            are happy to answer any questions you may have about the program!
          </div>
          <FieldGroup
            id="name"
            label="Name"
            type="text"
            required={false}
            onChange={this.handleChange}
            defaultValue={this.state.name}
          />
          {this.state.errors.includes('email') && (
            <div
              style={styles.error}
              id="regional-partner-mini-contact-error-email"
            >
              Please enter an email.
            </div>
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
            <div
              id="regional-partner-mini-contact-error-zip"
              style={styles.error}
            >
              Please enter your school ZIP Code.
            </div>
          )}
          <FieldGroup
            id="zip"
            label="School ZIP Code"
            type="text"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.state.zip}
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
          <FormGroup style={styles.select}>
            <ControlLabel>Your role</ControlLabel>
            <Select
              id="role"
              value={this.state.role}
              onChange={this.onRoleChange}
              placeholder="-"
              options={ROLE_MAP}
              {...SelectStyleProps}
            />
          </FormGroup>
          <FieldGroup
            id="notes"
            label="Questions or notes for your local Regional Partner"
            type="text"
            required={false}
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

export class RegionalPartnerMiniContactPopupLink extends React.Component {
  static propTypes = {
    zip: PropTypes.string,
    notes: PropTypes.string,
    sourcePageId: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      showing: false,
      options: null
    };

    $.ajax({
      type: 'GET',
      url: '/dashboardapi/v1/users/me/contact_details'
    })
      .done(results => {
        this.setState({
          options: {
            user_name: results.user_name,
            email: results.email,
            zip: this.props.zip || results.zip,
            notes: this.props.notes || results.notes
          }
        });
      })
      .fail(() => {
        this.setState({
          options: {zip: this.props.zip, notes: this.props.notes}
        });
      });
  }

  open = () => {
    this.setState({showing: true});
  };

  close = () => {
    this.setState({showing: false});
  };

  render() {
    return (
      <span>
        <span onClick={this.open}>{this.props.children}</span>
        <Modal show={this.state.showing} onHide={this.close}>
          <Modal.Header closeButton style={styles.modalHeader} />
          <Modal.Body style={styles.modalBody}>
            <div style={styles.miniContactContainer}>
              {this.state.options && (
                <RegionalPartnerMiniContact
                  options={this.state.options}
                  apiEndpoint="/dashboardapi/v1/pd/regional_partner_mini_contacts/"
                  sourcePageId={this.props.sourcePageId}
                />
              )}
            </div>
          </Modal.Body>
        </Modal>
      </span>
    );
  }
}
