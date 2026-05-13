import Toggle from '@code-dot-org/component-library/toggle';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {setSectionCodeReviewExpiresAt} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import i18n from '@cdo/locale';

import CodeReviewGroupsDataApi from './CodeReviewGroupsDataApi';

import moduleStyles from './codeReviewGroupsStatusToggle.module.scss';

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
      <div className={moduleStyles.toggleAndError}>
        <Toggle
          id="uitest-code-review-groups-toggle"
          name="enableCodeReviewToggle"
          checked={isToggledOn}
          onChange={toggleEnableCodeReview}
          label={i18n.enableCodeReview()}
        />
        {saveInProgress && (
          <span className={moduleStyles.spinner}>
            <Spinner size="medium" />
          </span>
        )}
        {saveError && (
          <p className={moduleStyles.saveError}>
            {isToggledOn
              ? i18n.codeReviewToggleDisableError()
              : i18n.codeReviewToggleEnableError()}
          </p>
        )}
      </div>

      {isToggledOn && (
        <p
          className={moduleStyles.enabledMessage}
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
    codeReviewExpiresAt: selectedSectionSelector(state).codeReviewExpiresAt,
    sectionId: selectedSectionSelector(state).id,
  }),
  dispatch => ({
    setCodeReviewExpiration: (sectionId, expiration) =>
      dispatch(setSectionCodeReviewExpiresAt(sectionId, expiration)),
  })
)(CodeReviewGroupsStatusToggle);
