/**
 * @file Modal containing privacy text for the 19-20 teacher application
 */
import PropTypes from 'prop-types';
import React from 'react';
import {Modal, Button} from 'react-bootstrap';
import color from '@cdo/apps/util/color';

export default class PrivacyDialog extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func.isRequired
  };

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        style={STYLE.modal}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Sharing information with your local Regional Partner
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={STYLE.bodyText}>
            Code.org works closely with local Regional Partners to organize and
            deliver the Professional Learning Program. By submitting this
            application, you are agreeing to allow Code.org to share information
            on how you use Code.org and the Professional Learning resources with
            your Regional Partner and school district. In order to organize the
            workshops and support you, our partners need to know who is
            attending and what content is relevant for them. So, we will share
            your contact information, which courses/units you are using in your
            classrooms and aggregate data about your classes. This includes the
            number of students in your classes, the demographic breakdown of
            your classroom, and the name of your school and district. We will
            not share any information about individual students with our
            Regional Partners - all information will be de-identified and
            aggregated. Our Regional Partners are contractually obliged to treat
            this information with the same level of confidentiality as Code.org.
            To see the full Code.org privacy policy, visit{' '}
            <a href="https://code.org/privacy" target="_blank">
              code.org/privacy
            </a>
            .
          </p>
          <p style={STYLE.bodyText}>
            Teachers may be required to get principal approval for their
            application to the Professional Learning Program. As part of this
            process principals may opt in to let the College Board share
            de-identified and aggregated Computer Science AP scores with
            Code.org to help us improve the program and curriculum. AP test
            scores will not be shared with Regional Partners.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.props.onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const STYLE = {
  modal: {
    width: '50%',
    marginLeft: '-25%'
  },
  bodyText: {
    color: color.dark_charcoal,
    fontSize: '10pt',
    lineHeight: '14pt'
  }
};
