import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import CodeReviewGroupsDataApi from './CodeReviewGroupsDataApi';
import Icon from '../../code-studio/components/Icon';
import {setCodeReviewExpiresAt} from '../../redux/sectionDataRedux';

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
  console.log(`isEnabled is ${isEnabled}`);
  // find days left by dividing milliseconds left by 1000 * 60 * 60 * 24. Round up so we
  // do not show "in 0 days" on the last day.
  const daysLeft =
    isEnabled &&
    Math.ceil((codeReviewExpiresAt - currentTime) / (1000 * 60 * 60 * 24));
  const api = new CodeReviewGroupsDataApi(sectionId);

  function toggleEnableCodeReview() {
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
  }

  return (
    <div>
      <div>
        <label htmlFor="enableCodeReview">
          {i18n.enableCodeReview()}
          <Icon iconId={isEnabled ? 'toggle-on' : 'toggle-off'} />
        </label>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={toggleEnableCodeReview}
          name="enableCodeReview"
          id="enableCodeReview"
          style={styles.checkbox}
        />
      </div>

      {saveError && <span>Error saving!</span>}

      {isEnabled && (
        <div style={styles.enabledMessage}>
          {i18n.codeReviewAutoDisableMessage({daysLeft})}
        </div>
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
  checkbox: {
    display: 'none'
  },
  enabledMessage: {
    fontStyle: 'italic'
  }
};
