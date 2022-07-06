import React from 'react';
import PropTypes from 'prop-types';
import commonMsg from '@cdo/locale';
import progressStyles from '@cdo/apps/code-studio/components/progress/progressStyles';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

const InstructionsAndButtons = ({
  isHidden,
  selectedSectionId,
  handleAllowEditing,
  handleLockLesson,
  handleShowAnswers
}) => {
  const hiddenStyle = isHidden ? styles.hidden : {};

  const viewSection = () => {
    const assessmentsUrl = teacherDashboardUrl(
      selectedSectionId,
      '/assessments'
    );
    window.open(assessmentsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <table style={hiddenStyle}>
        <tbody>
          <tr>
            <td>1. {commonMsg.allowEditingInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={handleAllowEditing}
              >
                {commonMsg.allowEditing()}
              </button>
            </td>
          </tr>
          <tr>
            <td>2. {commonMsg.lockStageInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={handleLockLesson}
              >
                {commonMsg.lockStage()}
              </button>
            </td>
          </tr>
          <tr>
            <td>3. {commonMsg.showAnswersInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={handleShowAnswers}
              >
                {commonMsg.showAnswers()}
              </button>
            </td>
          </tr>
          <tr>
            <td>4. {commonMsg.relockStageInstructions()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.orangeButton}
                onClick={handleLockLesson}
              >
                {commonMsg.relockStage()}
              </button>
            </td>
          </tr>
          <tr>
            <td>5. {commonMsg.reviewResponses()}</td>
            <td>
              <button
                type="button"
                style={progressStyles.whiteButton}
                onClick={viewSection}
              >
                {commonMsg.viewSection()}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{...styles.descriptionText, ...hiddenStyle}}>
        {commonMsg.autolock()}
      </div>
    </>
  );
};

InstructionsAndButtons.propTypes = {
  isHidden: PropTypes.bool,
  selectedSectionId: PropTypes.number,
  handleAllowEditing: PropTypes.func.isRequired,
  handleLockLesson: PropTypes.func.isRequired,
  handleShowAnswers: PropTypes.func.isRequired
};

const styles = {
  hidden: {
    display: 'none'
  },
  descriptionText: {
    marginTop: 10,
    marginBottom: 10
  }
};

export default InstructionsAndButtons;
