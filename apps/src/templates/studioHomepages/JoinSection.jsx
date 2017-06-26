import React from 'react';
import color from '@cdo/apps/util/color';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.charcoal,
    height: 68,
    width: 940,
    backgroundColor: color.white,
    marginTop: 20,
    marginBottom: 20
  },
  mainDashed: {
    borderWidth: 5,
    borderStyle: 'dashed',
    borderColor: color.border_gray,
  },
  heading: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.2,
    marginTop: 16,
    backgroundColor: color.white,
    color: color.teal
  },
  details: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 12,
    lineHeight: 2.5,
    marginBottom: 16,
    color: color.charcoal,
  },
  wordBox: {
    width: 495,
    marginLeft: 25,
    float: 'left',
    borderWidth: 1,
    borderColor: 'red'
  },
  inputBox: {
    float: 'left',
    marginTop: 15,
    borderRadius: 0,
    height: 26,
    paddingLeft: 25,
    width: 200
  },
  button: {
    float: 'left',
    marginTop: 15,
    marginLeft: 20,
    marginRight: 25
  },
};

const JoinSection = React.createClass({
  propTypes: {
    enrolledInASection: React.PropTypes.boolean,
  },

  joinSection() {
    console.log("This action will enroll the student in a section");
  },

  render() {
    const { enrolledInASection } = this.props;

    return (
      <div style={{...styles.main, ...(enrolledInASection ? styles.main : styles.mainDashed)}}>
        <div style={styles.wordBox}>
          <div style={styles.heading}>
            Join a Classroom
          </div>
          <div style={styles.details}>
            Join your teacher's class by entering their Section Code
          </div>
        </div>
        <input
          type="text"
          name="sectionCode"
          style={styles.inputBox}
          placeholder="Section Code (ABCDEF)"
        />
        <ProgressButton
          href={this.joinSection}
          color={ProgressButton.ButtonColor.gray}
          text="Join classroom"
          style={styles.button}
        />
      </div>
    );
  }

});

export default JoinSection;
