import React from 'react';
import PropTypes from 'prop-types';
import WorkshopPanel from './WorkshopPanel';

/**
 * Displays the sign-up link for a workshop.
 */
export default class SignUpPanel extends React.Component {
  static propTypes = {
    workshopId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired
  };

  render() {
    const signupUrl = `${location.origin}/pd/workshops/${
      this.props.workshopId
    }/enroll`;

    return (
      <WorkshopPanel header="Your workshop sign-up link:">
        <p>
          Share this link with teachers who need to sign up for your workshop.
        </p>
        <a href={signupUrl} target="_blank" rel="noopener noreferrer">
          {signupUrl}
        </a>
      </WorkshopPanel>
    );
  }
}
