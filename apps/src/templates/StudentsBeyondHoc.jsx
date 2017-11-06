import React, { PropTypes, Component } from 'react';
import i18n from '@cdo/locale';
import color from '../util/color';
import Responsive from '../responsive';
import CourseBlocksStudentGradeBands from './studioHomepages/CourseBlocksStudentGradeBands';
import VerticalImageResourceCardRow from './VerticalImageResourceCardRow';
import { LocalClassActionBlock } from './studioHomepages/TwoColumnActionBlock';
import { tutorialTypes } from './tutorialTypes.js';
import { pre2017MinecraftCards } from './congratsBeyondHocActivityCards';

const styles = {
  heading: {
    color: color.teal,
    width: '100%',
  },
};

export default class StudentsBeyondHoc extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(tutorialTypes).isRequired,
    MCShareLink: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired,
  };

  render() {
    const { isRtl, responsive } = this.props;


//Decide which set of cards to pass to VerticalImageResourceCardRow based on completedTutorialType and signedIn.

// set newMinecraftCards MCShareLink to the MCShareLink passed in here.
// IF this.props.MCShareLink && completedTutorialType === 2017Minecraft, then
// newMinecraftCards[2].MCShareLink = {this.props. MCShareLink}

    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>
          {i18n.congratsStudentHeading()}
        </h1>
        <VerticalImageResourceCardRow
          cards={pre2017MinecraftCards}
          isRtl={isRtl}
          responsive={responsive}
        />
        <CourseBlocksStudentGradeBands
          isRtl={isRtl}
          responsive={responsive}
          showContainer={false}
          hideBottomMargin={true}
        />
        <LocalClassActionBlock
          isRtl={isRtl}
          responsive={responsive}
          showHeading={false}
        />
      </div>
    );
  }
}
