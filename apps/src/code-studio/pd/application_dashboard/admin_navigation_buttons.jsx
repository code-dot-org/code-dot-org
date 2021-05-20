import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap';

export default class AdminNavigationButtons extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  handleFitClick = event => {
    event.preventDefault();
    this.context.router.push('/fit_cohort');
  };

  render() {
    return (
      <div style={styles.buttonContainer}>
        <Button
          href={this.context.router.createHref('/fit_cohort')}
          onClick={this.handleFitClick}
          style={styles.button}
        >
          View FiT Cohort
        </Button>
      </div>
    );
  }
}

const styles = {
  buttonContainer: {
    marginBottom: 20
  },
  button: {
    marginRight: '10px'
  }
};
