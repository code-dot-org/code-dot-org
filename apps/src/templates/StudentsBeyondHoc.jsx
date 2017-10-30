import React, { PropTypes, Component } from 'react';
import i18n from '@cdo/locale';
import color from '../util/color';
import Responsive from '../responsive';
import CourseBlocksStudentGradeBands from './studioHomepages/CourseBlocksStudentGradeBands';

const styles = {
  heading: {
    color: color.teal,
    width: '100%'
  },
};

export default class StudentsBeyondHoc extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(['applab', 'newMinecraft', 'oldMinecraft', 'other']).isRequired,
    MCShareLink: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  render() {
    const { isRtl, responsive } = this.props;

    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>
          {i18n.congratsStudentHeading()}
        </h1>
        <CourseBlocksStudentGradeBands
          isRtl={isRtl}
          responsive={responsive}
          showContainer={false}
        />
      </div>
    );
  }
}
