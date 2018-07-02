import React, {PropTypes} from 'react';
import {Button} from 'react-bootstrap';

const styles = {
  buttonContainer: {
    marginBottom: 20
  },
  button: {
    marginRight: '10px'
  }
};

export default class AdminNavigationButtons extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  handleTeacherconClick = event => {
    event.preventDefault();
    this.context.router.push('/teachercon_cohort');
  };

  handleFitClick = event => {
    event.preventDefault();
    this.context.router.push('/fit_cohort');
  };

  render() {
    return (
      <div style={styles.buttonContainer}>
        <Button
          href={this.context.router.createHref('/teachercon_cohort')}
          onClick={this.handleTeacherconClick}
          style={styles.button}
        >
          View TeacherCon Cohort
        </Button>
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
