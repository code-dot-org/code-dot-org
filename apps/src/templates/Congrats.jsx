import React, { PropTypes, Component } from 'react';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';

export default class Congrats extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(['applab', 'newMinecraft', 'oldMinecraft', 'other']).isRequired,
    MCShareLink: PropTypes.string
  };

  render() {
    const { completedTutorialType, MCShareLink } = this.props;

    return (
      <div>
        <Certificate
          completedTutorialType={completedTutorialType}
        />
        <StudentsBeyondHoc
          completedTutorialType={completedTutorialType}
          MCShareLink={MCShareLink}
        />
        <TeachersBeyondHoc/>
      </div>
    );
  }
}
