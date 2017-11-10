import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import color from '../util/color';
import CourseBlocksStudentGradeBands from './studioHomepages/CourseBlocksStudentGradeBands';
import VerticalImageResourceCardRow from './VerticalImageResourceCardRow';
import LocalClassActionBlock from './studioHomepages/LocalClassActionBlock';
import { tutorialTypes } from './tutorialTypes.js';
import { pre2017MinecraftCards } from './congratsBeyondHocActivityCards';

const styles = {
  heading: {
    color: color.teal,
    width: '100%',
  },
};

class StudentsBeyondHoc extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(tutorialTypes).isRequired,
    MCShareLink: PropTypes.string,
    signedIn: PropTypes.bool.isRequired,
  };

  render() {

    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>
          {i18n.congratsStudentHeading()}
        </h1>
        <VerticalImageResourceCardRow
          cards={pre2017MinecraftCards}
        />
        <CourseBlocksStudentGradeBands
          showContainer={false}
          hideBottomMargin={true}
        />
        <LocalClassActionBlock
          showHeading={false}
        />
      </div>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(StudentsBeyondHoc);
