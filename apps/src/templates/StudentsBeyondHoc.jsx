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

    const { isRtl, responsive, completedTutorialType, userType, isEnglish, MCShareLink } = this.props;
    const signedIn = (userType === "teacher" || userType === "student");

    var specificCardSet;
    switch (true) {
      case completedTutorialType === 'pre2017Minecraft' && isEnglish:
          specificCardSet = 'pre2017MinecraftCards';
        break;
      case completedTutorialType === 'pre2017Minecraft' && !isEnglish:
          specificCardSet ='nonEnglishPre2017MinecraftCards';
        break;
      case completedTutorialType === '2017Minecraft' && isEnglish:
          specificCardSet = 'newMinecraftCards';
        break;
      case completedTutorialType === '2017Minecraft' && !isEnglish:
          specificCardSet = 'nonEnglishNewMinecraftCards';
        break;
      case completedTutorialType === 'applab' && signedIn:
          specificCardSet = 'signedInApplabCards';
        break;
      case completedTutorialType === 'applab' && !signedIn:
          specificCardSet = 'signedOutApplabCards';
        break;
      case completedTutorialType === 'other' && signedIn && isEnglish:
          specificCardSet = 'signedInDefaultCards';
        break;
      case completedTutorialType === 'other' && signedIn && !isEnglish:
          specificCardSet = 'signedInNonEnglishDefaultCards';
        break;
      case completedTutorialType === 'other' && !signedIn && isEnglish:
          specificCardSet = 'signedOutDefaultCards';
        break;
      case completedTutorialType === 'other' && !signedIn && !isEnglish:
          specificCardSet = 'signedOutNonEnglishDefaultCards';
        break;
      default:
        specificCardSet = 'signedOutDefaultCards';
    }
    const cards = cardSets[specificCardSet];

    // 2017 Minecraft Tutorial has a share link that can be used on Minecraft // Education to import code. Check if the 2017 Minecraft tutorial was
    // completed; if it was, update the Minecraft share link for the card that // goes to Minecraft Education.
    function findMinecraftCard(card) {
      return card.MCShareLink === "";
    }

    if (specificCardSet === "newMinecraftCards" && MCShareLink) {
      var MinecraftCard = cards.find(findMinecraftCard);
      MinecraftCard.MCShareLink = MCShareLink;
    }

    const heading = isEnglish ? i18n.congratsStudentHeading() : i18n.congratsStudentHeadingNonEng();

    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>
          {heading}
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
