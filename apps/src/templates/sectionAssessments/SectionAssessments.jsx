import React, {Component, PropTypes} from 'react';

class SectionAssessments extends Component {
  static propTypes = {
    section: PropTypes.object,
  };

  render() {
    return (
      <div>
        SectionAssessments will be built in react and go here.
        <p>
          {`The section id is ${this.props.section.id}`}
        </p>
      </div>
    );
  }
}

export default SectionAssessments;
