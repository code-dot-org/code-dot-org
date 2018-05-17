import React, {Component, PropTypes} from 'react';

class SectionAssessments extends Component {
  static propTypes = {
    section: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div>
        SectionAssessments will be built in react and go here.
      </div>
    );
  }
}

export default SectionAssessments;
