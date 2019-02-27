import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../form_components/FieldGroup';
import color from '@cdo/apps/util/color';

const styles = {
  error: {
    color: color.red
  },
  miniContactContainer: {
    backgroundColor: color.lightest_cyan,
    padding: 20,
    borderRadius: 10
  },
  modalHeader: {
    padding: '0 15px 0 0',
    height: 36,
    borderBottom: 'none'
  },
  modalBody: {
    textAlign: 'left',
    padding: 15,
    overflow: 'auto',
    maxHeight: 'calc(100vh - 100px)',
    width: '100%'
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
        <div
          id={`regional-partner-mini-contact-thanks-${this.props.sourcePageId}`}
          className="regional-partner-mini-contact-thanks"
        >
          Your message has been sent. Thank you. We'll be in touch.
        </div>
      );
    } else {
      return (
        <FormGroup
          id={`regional-partner-mini-contact-form-${this.props.sourcePageId}`}
          className="regional-partner-mini-contact-form"
        >
          <p>
            Your local Code.org Regional Partner provides high quality Code.org
            professional learning to teachers, and can help guide your school or
            district on implementation, certification, funding, and more. They
            are happy to answer any questions you may have about the program!
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
        {this.state.showing && (
          <div
            className="modal"
            id="tutorialPopup"
            style={{display: 'block'}}
            onClick={this.close}
          >
            <div
              className="modal-dialog modal-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header" style={styles.modalHeader}>
                  <button
                    className="close"
                    data-dismiss="modal"
                    style={{height: 48}}
                    type="button"
                    onClick={this.close}
                  >
                    <span
                      aria-hidden="true"
                      style={{fontSize: 48, marginTop: -2}}
                    >
                      ×
                    </span>
                  </button>
                  <div style={{clear: 'both'}} />
                </div>
                <div style={styles.modalBody}>
                  <div style={styles.miniContactContainer}>
                    {this.state.options && (
                      <RegionalPartnerMiniContact
                        options={this.state.options}
                        apiEndpoint="/dashboardapi/v1/pd/regional_partner_mini_contacts/"
                        sourcePageId={this.props.sourcePageId}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </span>
    );
  }
}
