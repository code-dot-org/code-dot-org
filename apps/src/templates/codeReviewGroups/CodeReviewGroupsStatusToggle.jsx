import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Toggle from '@cdo/apps/componentLibrary/toggle/Toggle';
import {
  setSectionCodeReviewExpiresAt,
  selectedSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import CodeReviewGroupsDataApi from './CodeReviewGroupsDataApi';

function CodeReviewGroupsStatusToggle({
  codeReviewExpiresAt,
  sectionId,
  setCodeReviewExpiration,
}) {
  const [saveError, setSaveError] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const currentTime = Date.now();
  const isToggledOn = codeReviewExpiresAt
    ? codeReviewExpiresAt > currentTime
    : false;
  // find days left by dividing milliseconds left by 1000 * 60 * 60 * 24. Round up so we
  // do not show "in 0 days" on the last day.
  const daysLeft =
    isToggledOn &&
    Math.ceil((codeReviewExpiresAt - currentTime) / (1000 * 60 * 60 * 24));
  const api = new CodeReviewGroupsDataApi(sectionId);

  const toggleEnableCodeReview = () => {
    setSaveError(false);
    setSaveInProgress(true);
    const toggledValue = !isToggledOn;
    api
      .setCodeReviewEnabled(toggledValue)
      .success(result => {
        const newExpiration = result.expiration;
        setCodeReviewExpiration(sectionId, newExpiration);
        setSaveInProgress(false);
      })
      .fail(() => {
        setSaveError(true);
        setSaveInProgress(false);
      });
  };

  return (
    <div>
      <div style={styles.toggleAndError}>
        <Toggle
          name="enableCodeReviewToggle"
          checked={isToggledOn}
          onChange={toggleEnableCodeReview}
          label={i18n.enableCodeReview()}
        />
        {saveInProgress && <Spinner style={styles.spinner} size="medium" />}
        {saveError && (
          <p style={styles.saveError}>
            {isToggledOn
              ? i18n.codeReviewToggleDisableError()
              : i18n.codeReviewToggleEnableError()}
          </p>
        )}
      </div>

      {isToggledOn && (
        <p
          style={styles.enabledMessage}
          name="enabledCodeReviewMessage"
          id="uitest-code-review-groups-status-message"
        >
          {i18n.codeReviewAutoDisableMessage({daysLeft})}
        </p>
      )}
    </div>
  );
}

CodeReviewGroupsStatusToggle.propTypes = {
  codeReviewExpiresAt: PropTypes.number,
  sectionId: PropTypes.number,
  setCodeReviewExpiration: PropTypes.func,
};

export const UnconnectedCodeReviewGroupsStatusToggle =
  CodeReviewGroupsStatusToggle;

export default connect(
  state => ({
    codeReviewExpiresAt: selectedSection(state).codeReviewExpiresAt,
    sectionId: selectedSection(state).id,
  }),
  dispatch => ({
    setCodeReviewExpiration: (sectionId, expiration) =>
      dispatch(setSectionCodeReviewExpiresAt(sectionId, expiration)),
  })
)(CodeReviewGroupsStatusToggle);

const styles = {
  enabledMessage: {
    fontStyle: 'italic',
    color: color.dark_charcoal,
    width: 360,
  },
  saveError: {
    color: color.red,
    margin: 8,
  },
  toggleAndError: {
    display: 'flex',
  },
  spinner: {
    marginLeft: 8,
  },
};
