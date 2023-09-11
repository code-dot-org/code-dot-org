import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import PaneHeader, {PaneButton} from '@cdo/apps/templates/PaneHeader';
import InstructionsTab from '@cdo/apps/templates/instructions/InstructionsTab';
import BackgroundMusicMuteButton from '@cdo/apps/templates/instructions/BackgroundMusicMuteButton';
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';
import InlineAudio from '@cdo/apps/templates/instructions/InlineAudio';
import {TabType} from './TopInstructions';
import i18n from '@cdo/locale';
import color from '../../util/color';
import styleConstants from '../../styleConstants';

function TopInstructionsHeader(props) {
  const {
    teacherOnly,
    tabSelected,
    isCSDorCSP,
    displayHelpTab,
    displayFeedback,
    levelHasMiniRubric,
    displayDocumentationTab,
    displayReviewTab,
    displayTaRubricTab,
    isViewingAsTeacher,
    hasBackgroundMusic,
    fetchingData,
    handleDocumentationClick,
    handleInstructionTabClick,
    handleHelpTabClick,
    handleCommentTabClick,
    handleDocumentationTabClick,
    handleReviewTabClick,
    handleTeacherOnlyTabClick,
    handleTaRubricTabClick,
    handleClickCollapser,
    isOldPurpleColor,
    isMinecraft,
    dynamicInstructions,
    ttsLongInstructionsUrl,
    hasContainedLevels,
    isRtl,
    documentationUrl,
    teacherMarkdown,
    exampleSolutions,
    isViewingAsInstructorInTraining,
    isEmbedView,
    isCollapsed,
    collapsible,
  } = props;

  const showContainedLevelAnswer =
    hasContainedLevels && $('#containedLevelAnswer0').length > 0;

  const collapserIconStyles = {
    ...styles.collapserIcon.showHideButton,
    ...(isRtl
      ? styles.collapserIcon.showHideButtonRtl
      : styles.collapserIcon.showHideButtonLtr),
    ...(teacherOnly && styles.collapserIcon.teacherOnlyColor),
  };

  return (
    <PaneHeader
      hasFocus={false}
      isOldPurpleColor={isOldPurpleColor}
      teacherOnly={teacherOnly}
      isMinecraft={isMinecraft}
    >
      <div style={styles.paneHeaderOverride}>
        {/* For CSF contained levels we use the same collapse function as CSD/CSP*/}
        {collapsible &&
          !isEmbedView &&
          (isCSDorCSP || hasContainedLevels) &&
          !dynamicInstructions && (
            <CollapserIcon
              id="ui-test-collapser"
              isCollapsed={isCollapsed}
              onClick={handleClickCollapser}
              style={collapserIconStyles}
            />
          )}
        {documentationUrl && tabSelected !== TabType.COMMENTS && (
          <PaneButton
            iconClass="fa fa-book"
            label={i18n.documentation()}
            isRtl={isRtl}
            headerHasFocus={false}
            onClick={handleDocumentationClick}
            isMinecraft={isMinecraft}
            style={styles.documentationButton}
          />
        )}
        <div
          style={{
            ...styles.helpTabs,
            ...(isRtl ? styles.helpTabsRtl : styles.helpTabsLtr),
          }}
        >
          <InstructionsTab
            className="uitest-instructionsTab"
            onClick={handleInstructionTabClick}
            selected={tabSelected === TabType.INSTRUCTIONS}
            isLegacyTextColor={isOldPurpleColor}
            text={i18n.instructions()}
            teacherOnly={teacherOnly}
            isMinecraft={isMinecraft}
            isRtl={isRtl}
          />
          {isCSDorCSP && displayHelpTab && (
            <InstructionsTab
              className="uitest-helpTab"
              onClick={handleHelpTabClick}
              selected={tabSelected === TabType.RESOURCES}
              isLegacyTextColor={isOldPurpleColor}
              text={i18n.helpTips()}
              teacherOnly={teacherOnly}
              isMinecraft={isMinecraft}
              isRtl={isRtl}
            />
          )}
          {isCSDorCSP && displayFeedback && (!fetchingData || teacherOnly) && (
            <InstructionsTab
              className="uitest-feedback"
              onClick={handleCommentTabClick}
              selected={tabSelected === TabType.COMMENTS}
              isLegacyTextColor={isOldPurpleColor}
              text={levelHasMiniRubric ? i18n.rubric() : i18n.feedback()}
              teacherOnly={teacherOnly}
              isMinecraft={isMinecraft}
              isRtl={isRtl}
            />
          )}
          {displayDocumentationTab && (
            <InstructionsTab
              onClick={handleDocumentationTabClick}
              selected={tabSelected === TabType.DOCUMENTATION}
              isLegacyTextColor={isOldPurpleColor}
              text={i18n.documentation()}
              teacherOnly={teacherOnly}
              isMinecraft={isMinecraft}
              isRtl={isRtl}
            />
          )}
          {displayReviewTab && (
            <InstructionsTab
              className="uitest-reviewTab"
              onClick={handleReviewTabClick}
              selected={tabSelected === TabType.REVIEW}
              isLegacyTextColor={isOldPurpleColor}
              text={i18n.review()}
              teacherOnly={teacherOnly}
              isMinecraft={isMinecraft}
              isRtl={isRtl}
            />
          )}
          {displayTaRubricTab && (
            <InstructionsTab
              className="uitest-taRubricTab"
              onClick={handleTaRubricTabClick}
              selected={tabSelected === TabType.TA_RUBRIC}
              isLegacyTextColor={isOldPurpleColor}
              text={i18n.rubric()}
              teacherOnly={false}
              isMinecraft={isMinecraft}
              isRtl={isRtl}
            />
          )}
          {(isViewingAsTeacher || isViewingAsInstructorInTraining) &&
            (teacherMarkdown ||
              showContainedLevelAnswer ||
              exampleSolutions.length > 0) && (
              <InstructionsTab
                className="uitest-teacherOnlyTab"
                onClick={handleTeacherOnlyTabClick}
                selected={tabSelected === TabType.TEACHER_ONLY}
                text={i18n.teacherOnly()}
                teacherOnly={teacherOnly}
                isMinecraft={isMinecraft}
                isRtl={isRtl}
              />
            )}
        </div>
        {hasBackgroundMusic && (
          <BackgroundMusicMuteButton
            className="uitest-mute-music-button"
            isMinecraft={isMinecraft}
            isRtl={isRtl}
          />
        )}
        {/* For CSF contained levels we use the same audio button location as CSD/CSP*/}
        {tabSelected === TabType.INSTRUCTIONS &&
          ttsLongInstructionsUrl &&
          (hasContainedLevels || isCSDorCSP) && (
            <InlineAudio
              src={ttsLongInstructionsUrl}
              style={{
                ...styles.audio,
                ...(isRtl ? styles.audioRTL : styles.audioLTR),
              }}
              autoplayTriggerElementId="codeApp"
              isRoundedVolumeIcon
              isLegacyStyles={isOldPurpleColor}
            />
          )}
      </div>
    </PaneHeader>
  );
}

const styles = {
  paneHeaderOverride: {
    color: color.default_text,
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
  audioRTL: {
    wrapper: {
      order: 5,
    },
  },
  audio: {
    button: {
      height: 24,
      marginTop: '3px',
      marginBottom: '3px',
    },
    buttonImg: {
      lineHeight: '20px',
      fontSize: 15,
      paddingLeft: 12,
    },
  },
  audioLTR: {
    wrapper: {
      order: 5,
    },
  },
  helpTabs: {
    paddingTop: 6,
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    minWidth: 100,
  },
  helpTabsLtr: {
    paddingLeft: 30,
  },
  helpTabsRtl: {
    paddingRight: 30,
  },
  collapserIcon: {
    showHideButton: {
      position: 'absolute',
      top: 0,
      margin: 0,
      cursor: 'pointer',
      lineHeight: styleConstants['workspace-headers-height'] + 'px',
      fontSize: 18,
      ':hover': {
        cursor: 'pointer',
        color: color.white,
      },
    },
    showHideButtonLtr: {
      left: 8,
    },
    showHideButtonRtl: {
      right: 8,
    },
    teacherOnlyColor: {
      color: color.lightest_cyan,
      ':hover': {
        cursor: 'pointer',
        color: color.default_text,
      },
    },
  },
  documentationButton: {
    order: 4,
    whiteSpace: 'nowrap',
    minWidth: 'fit-content',
  },
};

TopInstructionsHeader.propTypes = {
  teacherOnly: PropTypes.bool,
  tabSelected: PropTypes.string.isRequired,
  isCSDorCSP: PropTypes.bool,
  displayHelpTab: PropTypes.bool,
  displayFeedback: PropTypes.bool,
  levelHasMiniRubric: PropTypes.bool,
  displayDocumentationTab: PropTypes.bool,
  displayReviewTab: PropTypes.bool,
  displayTaRubricTab: PropTypes.bool,
  isViewingAsTeacher: PropTypes.bool,
  hasBackgroundMusic: PropTypes.bool.isRequired,
  fetchingData: PropTypes.bool,
  handleDocumentationClick: PropTypes.func.isRequired,
  handleInstructionTabClick: PropTypes.func.isRequired,
  handleHelpTabClick: PropTypes.func.isRequired,
  handleCommentTabClick: PropTypes.func.isRequired,
  handleDocumentationTabClick: PropTypes.func.isRequired,
  handleReviewTabClick: PropTypes.func.isRequired,
  handleTeacherOnlyTabClick: PropTypes.func.isRequired,
  handleTaRubricTabClick: PropTypes.func.isRequired,
  handleClickCollapser: PropTypes.func.isRequired,
  isOldPurpleColor: PropTypes.bool,
  isMinecraft: PropTypes.bool.isRequired,
  dynamicInstructions: PropTypes.object,
  ttsLongInstructionsUrl: PropTypes.string,
  hasContainedLevels: PropTypes.bool,
  isRtl: PropTypes.bool.isRequired,
  documentationUrl: PropTypes.string,
  teacherMarkdown: PropTypes.string,
  exampleSolutions: PropTypes.array,
  isViewingAsInstructorInTraining: PropTypes.bool,
  isEmbedView: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  collapsible: PropTypes.bool.isRequired,
};

export default TopInstructionsHeader;
