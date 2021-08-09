import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import CourseBlocksStudentGradeBands from './studioHomepages/CourseBlocksStudentGradeBands';
import VerticalImageResourceCardRow from './VerticalImageResourceCardRow';
import {LocalClassActionBlock} from './studioHomepages/TwoColumnActionBlock';
import {tutorialTypes} from './tutorialTypes.js';
import {cardSets} from './congratsBeyondHocActivityCards';
import {ResponsiveSize} from '@cdo/apps/code-studio/responsiveRedux';

class StudentsBeyondHoc extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(tutorialTypes).isRequired,
    MCShareLink: PropTypes.string,
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    userType: PropTypes.oneOf(['signedOut', 'teacher', 'student']).isRequired,
    under13: PropTypes.bool,
    isEnglish: PropTypes.bool.isRequired,
    hideDancePartyFollowUp: PropTypes.bool
  };

  render() {
    const {
      responsiveSize,
      completedTutorialType,
      userType,
      isEnglish,
      MCShareLink,
      under13,
      hideDancePartyFollowUp
    } = this.props;

    const signedIn = userType === 'teacher' || userType === 'student';

    const desktop = responsiveSize !== ResponsiveSize.xs;

    const headingStyle = desktop ? styles.heading : styles.mobileHeading;

    var specificCardSet;
    switch (true) {
      case completedTutorialType === 'pre2017Minecraft' && isEnglish && under13:
        specificCardSet = 'youngerThan13Pre2017MinecraftCards';
        break;
      case completedTutorialType === 'pre2017Minecraft' && isEnglish:
        specificCardSet = 'pre2017MinecraftCards';
        break;
      case completedTutorialType === 'pre2017Minecraft' && !isEnglish:
        specificCardSet = 'nonEnglishPre2017MinecraftCards';
        break;
      case completedTutorialType === '2017Minecraft' && isEnglish && under13:
        specificCardSet = 'youngerThan13HeroMinecraftCards';
        break;
      case completedTutorialType === '2017Minecraft' && isEnglish:
        specificCardSet = 'heroMinecraftCards';
        break;
      case completedTutorialType === '2017Minecraft' && !isEnglish:
        specificCardSet = 'nonEnglishHeroMinecraftCards';
        break;
      case completedTutorialType === '2018Minecraft' && isEnglish && under13:
        specificCardSet = 'youngerThan13AquaticMinecraftCards';
        break;
      case completedTutorialType === '2018Minecraft' && isEnglish:
        specificCardSet = 'aquaticMinecraftCards';
        break;
      case completedTutorialType === '2018Minecraft' && !isEnglish:
        specificCardSet = 'nonEnglishAquaticMinecraftCards';
        break;
      case completedTutorialType === 'applab' && signedIn:
        specificCardSet = 'signedInApplabCards';
        break;
      case completedTutorialType === 'applab' && !signedIn:
        specificCardSet = 'signedOutApplabCards';
        break;
      case completedTutorialType === 'dance' &&
        signedIn &&
        isEnglish &&
        hideDancePartyFollowUp:
        specificCardSet = 'signedInEnglishDancePartyAquaticCards';
        break;
      case completedTutorialType === 'dance' &&
        signedIn &&
        !isEnglish &&
        hideDancePartyFollowUp:
        specificCardSet = 'signedInNonEnglishDancePartyAquaticCards';
        break;
      case completedTutorialType === 'dance' &&
        !signedIn &&
        isEnglish &&
        hideDancePartyFollowUp:
        specificCardSet = 'signedOutEnglishDancePartyAquaticCards';
        break;
      case completedTutorialType === 'dance' &&
        !signedIn &&
        !isEnglish &&
        hideDancePartyFollowUp:
        specificCardSet = 'signedOutNonEnglishDancePartyAquaticCards';
        break;
      case completedTutorialType === 'dance' && signedIn && isEnglish:
        specificCardSet = 'signedInEnglishDancePartyCards';
        break;
      case completedTutorialType === 'dance' && signedIn && !isEnglish:
        specificCardSet = 'signedInNonEnglishDancePartyCards';
        break;
      case completedTutorialType === 'dance' && !signedIn && isEnglish:
        specificCardSet = 'signedOutEnglishDancePartyCards';
        break;
      case completedTutorialType === 'dance' && !signedIn && !isEnglish:
        specificCardSet = 'signedOutNonEnglishDancePartyCards';
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
      return card.MCShareLink === '';
    }

    if (
      (specificCardSet === 'newMinecraftCards' ||
        specificCardSet === 'nonEnglishNewMinecraftCards') &&
      MCShareLink
    ) {
      var MinecraftCard = cards.find(findMinecraftCard);
      MinecraftCard.MCShareLink = MCShareLink;
    }

    const heading = isEnglish
      ? i18n.congratsStudentHeading()
      : i18n.congratsStudentHeadingNonEng();

    return (
      <div style={styles.container}>
        <h1 style={headingStyle}>{heading}</h1>
        <VerticalImageResourceCardRow cards={cards} />
        {isEnglish && (
          <CourseBlocksStudentGradeBands
            showContainer={false}
            hideBottomMargin={true}
          />
        )}
        <div style={styles.spacer} />
        <LocalClassActionBlock showHeading={false} />
      </div>
    );
  }
}

const styles = {
  heading: {
    width: '100%'
  },
  mobileHeading: {
    fontSize: 24,
    lineHeight: 1.5
  },
  spacer: {
    height: 20
  }
};

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize
}))(StudentsBeyondHoc);
