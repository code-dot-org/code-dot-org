import React, { PropTypes, Component } from 'react';
import i18n from '@cdo/locale';
import Responsive from '../responsive';
import CourseBlocksStudentGradeBands from './studioHomepages/CourseBlocksStudentGradeBands';
import VerticalImageResourceCardRow from './VerticalImageResourceCardRow';
import { LocalClassActionBlock } from './studioHomepages/TwoColumnActionBlock';
import { tutorialTypes } from './tutorialTypes.js';
import { cardSets } from './congratsBeyondHocActivityCards';

const styles = {
  heading: {
    width: '100%',
  },
  mobileHeading: {
    fontSize: 24,
    lineHeight: 1.5,
  },
  spacer: {
    height: 20
  }
};

export default class StudentsBeyondHoc extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(tutorialTypes).isRequired,
    MCShareLink: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired,
    userType: PropTypes.oneOf(["signedOut", "teacher", "student"]).isRequired,
    userAge: PropTypes.number,
    isEnglish: PropTypes.bool.isRequired,
  };

  render() {
    const { isRtl, responsive, completedTutorialType, userType, isEnglish, MCShareLink, userAge } = this.props;

    const signedIn = (userType === "teacher" || userType === "student");

    const under13 = userAge < 13;

    const desktop = (responsive.isResponsiveCategoryActive('lg') || responsive.isResponsiveCategoryActive('md'));

    const headingStyle = desktop ? styles.heading : styles.mobileHeading;

    var specificCardSet;
    switch (true) {
      case completedTutorialType === 'pre2017Minecraft' && isEnglish && under13:
          specificCardSet = 'youngerThan13pre2017MinecraftCards';
        break;
      case completedTutorialType === 'pre2017Minecraft' && isEnglish:
          specificCardSet = 'pre2017MinecraftCards';
        break;
      case completedTutorialType === 'pre2017Minecraft' && !isEnglish:
          specificCardSet ='nonEnglishPre2017MinecraftCards';
        break;
      case completedTutorialType === '2017Minecraft' && isEnglish:
          specificCardSet = 'newMinecraftCards';
        break;
      case completedTutorialType === '2017Minecraft' && isEnglish && under13:
          specificCardSet = 'youngerThan13NewMinecraftCards';
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
      case completedTutorialType === 'other' && isEnglish && under13:
          specificCardSet = 'youngerThan13DefaultCards';
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

    if ((specificCardSet === "newMinecraftCards" || specificCardSet === "nonEnglishNewMinecraftCards") && MCShareLink) {
      var MinecraftCard = cards.find(findMinecraftCard);
      MinecraftCard.MCShareLink = MCShareLink;
    }

    const heading = isEnglish ? i18n.congratsStudentHeading() : i18n.congratsStudentHeadingNonEng();

    return (
      <div style={styles.container}>
        <h1 style={headingStyle}>
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
            hideBottomMargin={true}
          />
        )}
        <div style={styles.spacer}/>
        <LocalClassActionBlock
          showHeading={false}
        />
      </div>
    );
  }
}
