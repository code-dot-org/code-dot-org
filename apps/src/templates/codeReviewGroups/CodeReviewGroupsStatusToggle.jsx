import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import CodeReviewGroupsDataApi from './CodeReviewGroupsDataApi';
import {setCodeReviewExpiresAt} from '../../redux/sectionDataRedux';
import ToggleSwitch from '@cdo/apps/code-studio/components/ToggleSwitch';

function CodeReviewGroupsStatusToggle({
  codeReviewExpiresAt,
  sectionId,
  setCodeReviewExpiration
}) {
  const [saveError, setSaveError] = useState(false);
  const currentTime = Date.now();
  const isEnabled = codeReviewExpiresAt
    ? codeReviewExpiresAt > currentTime
    : false;
  // find days left by dividing milliseconds left by 1000 * 60 * 60 * 24. Round up so we
  // do not show "in 0 days" on the last day.
  const daysLeft =
    isEnabled &&
    Math.ceil((codeReviewExpiresAt - currentTime) / (1000 * 60 * 60 * 24));
  const api = new CodeReviewGroupsDataApi(sectionId);

  const toggleEnableCodeReview = () => {
    setSaveError(false);
    const toggledValue = !isEnabled;
    api
      .setCodeReviewEnabled(toggledValue)
      .success(result => {
        const newExpiration = result.expiration;
        setCodeReviewExpiration(newExpiration);
      })
      .fail(() => {
        setSaveError(true);
      });
  };

  return (
    <div>
      <ToggleSwitch
        isEnabled={isEnabled}
        onToggle={toggleEnableCodeReview}
        label={i18n.enableCodeReview()}
      />

      {saveError && <span>Error saving!</span>}

      {isEnabled && (
        <p style={styles.enabledMessage}>
          {i18n.codeReviewAutoDisableMessage({daysLeft})}
        </p>
      )}
    </div>
  );
}

CodeReviewGroupsStatusToggle.propTypes = {
  codeReviewExpiresAt: PropTypes.number,
  sectionId: PropTypes.number,
  setCodeReviewExpiration: PropTypes.func
};

export default connect(
  state => ({
    codeReviewExpiresAt: state.sectionData.section.codeReviewExpiresAt,
    sectionId: state.sectionData.section.id
  }),
  dispatch => ({
    setCodeReviewExpiration: expiration =>
      dispatch(setCodeReviewExpiresAt(expiration))
  })
)(CodeReviewGroupsStatusToggle);

const styles = {
  enabledMessage: {
    fontStyle: 'italic'
  }
};
