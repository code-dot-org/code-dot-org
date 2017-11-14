import React, { PropTypes, Component } from 'react';
import i18n from '@cdo/locale';
import color from '../util/color';
import Responsive from '../responsive';
import CourseBlocksStudentGradeBands from './studioHomepages/CourseBlocksStudentGradeBands';
import VerticalImageResourceCardRow from './VerticalImageResourceCardRow';
import { LocalClassActionBlock } from './studioHomepages/TwoColumnActionBlock';
import { tutorialTypes } from './tutorialTypes.js';
import { cardSets } from './congratsBeyondHocActivityCards';

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
    userType: PropTypes.oneOf(["signedOut", "teacher", "student"]).isRequired,
    isEnglish: PropTypes.bool.isRequired,
  };

  render() {
    const { isRtl, responsive, completedTutorialType, userType, isEnglish } = this.props;
    const signedIn = (userType === "teacher" || userType === "student");

    var specificCardSet;
    switch (true) {
      case completedTutorialType === 'pre2017Minecraft':
          specificCardSet = 'pre2017MinecraftCards';
        break;
      case completedTutorialType === '2017Minecraft':
          specificCardSet = 'newMinecraftCards';
        break;
      case completedTutorialType === 'applab' && signedIn:
          specificCardSet = 'signedInApplabCards';
        break;
      case completedTutorialType === 'applab' && !signedIn:
          specificCardSet = 'signedOutApplabCards';
        break;
      case completedTutorialType === 'other' && signedIn:
          specificCardSet = 'signedInDefaultCards';
        break;
      default:
        specificCardSet = 'signedOutDefaultCards';
    }
    const cards = cardSets[specificCardSet];

    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>
          {i18n.congratsStudentHeading()}
        </h1>
        <VerticalImageResourceCardRow
          cards={cards}
          isRtl={isRtl}
          responsive={responsive}
        />
        {isEnglish && (
          <CourseBlocksStudentGradeBands
            isRtl={isRtl}
            responsive={responsive}
            showContainer={false}
            hideBottomMargin={false}
          />
        )}
        <LocalClassActionBlock
          isRtl={isRtl}
          responsive={responsive}
          showHeading={false}
        />
      </div>
    );
  }
}
