import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';
import { tutorialTypes } from './tutorialTypes.js';

const styles = {
  container: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 970
  },
};

class Congrats extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(tutorialTypes).isRequired,
    MCShareLink: PropTypes.string,
    userType: PropTypes.oneOf(["signedOut", "teacher", "student"]).isRequired,
    isEnglish: PropTypes.bool.isRequired,
    responsiveSize: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
  };

  render() {
    const { completedTutorialType, MCShareLink, userType, isEnglish } = this.props;
    const signedIn = (userType === "teacher" || userType === "student");

    return (
      <div style={styles.container}>
        <Certificate
          completedTutorialType={completedTutorialType}
        />
        {userType === "teacher" && (
          <TeachersBeyondHoc/>
        )}
        <StudentsBeyondHoc
          completedTutorialType={completedTutorialType}
          MCShareLink={MCShareLink}
          signedIn={signedIn}
          isEnglish={isEnglish}
        />
        {userType === "signedOut" && (
          <TeachersBeyondHoc/>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(Congrats);
