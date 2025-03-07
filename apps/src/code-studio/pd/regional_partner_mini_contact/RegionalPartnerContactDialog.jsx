import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import color from '@cdo/apps/util/color';

import RegionalPartnerContactForm from './RegionalPartnerContactForm';

// import Modal from '@code-dot-org/component-library/modal'

export default class RegionalPartnerContactDialog extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    notes: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    sourcePageId: PropTypes.string.isRequired,
    zip: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      showing: true,
      options: null,
    };

    $.ajax({
      type: 'GET',
      url: '/dashboardapi/v1/users/me/contact_details',
    })
      .done(results => {
        this.setState({
          options: {
            user_name: results.user_name,
            email: results.email,
            zip: `${this.props.zip || results.zip}`,
            notes: this.props.notes || results.notes,
          },
        });
      })
      .fail(() => {
        this.setState({
          options: {zip: this.props.zip, notes: this.props.notes},
        });
      });
  }

  render() {
    return (
      <Modal show={this.state.showing} onHide={this.props.onClose}>
        <Modal.Header closeButton style={styles.modalHeader} />
        <Modal.Body style={styles.modalBody}>
          <div style={styles.miniContactContainer}>
            {this.state.options && (
              <RegionalPartnerContactForm
                options={this.state.options}
                apiEndpoint="/dashboardapi/v1/pd/regional_partner_mini_contacts/"
                sourcePageId={this.props.sourcePageId}
              />
            )}
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

const styles = {
  miniContactContainer: {
    backgroundColor: color.lightest_cyan,
    padding: 20,
    borderRadius: 10,
    textAlign: 'left',
  },
  modalHeader: {
    padding: '0 15px 0 0',
    height: 30,
    borderBottom: 'none',
  },
  modalBody: {
    padding: '0 15px 15px 15px',
    fontSize: 14,
    lineHeight: '22px',
  },
};
