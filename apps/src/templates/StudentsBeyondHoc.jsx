import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import color from '../util/color';
import CourseBlocksStudentGradeBands from './studioHomepages/CourseBlocksStudentGradeBands';
import VerticalImageResourceCardRow from './VerticalImageResourceCardRow';
import LocalClassActionBlock from './studioHomepages/TwoColumnActionBlock';
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
    isRtl: PropTypes.bool.isRequired
  };

  render() {
    const { isRtl } = this.props;

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
          isRtl={isRtl}
        />
        <LocalClassActionBlock
          showHeading={false}
          isRtl={isRtl}
        />
      </div>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(StudentsBeyondHoc);
