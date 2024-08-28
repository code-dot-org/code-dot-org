import PropTypes from 'prop-types';
import React from 'react';

import LevelFeedback from '@cdo/apps/templates/feedback/LevelFeedback';
import i18n from '@cdo/locale';

import {levelFeedbackShape} from './types';

function AllFeedbacks({feedbacksByLevel}) {
  const noFeedback = feedbacksByLevel.length === 0;

  return (
    <div>
      <h1 style={styles.header}>{i18n.feedbackAll()}</h1>
      {noFeedback && <div>{i18n.feedbackNoneYet()}</div>}
      {feedbacksByLevel.map((levelFeedback, i) => {
        return <LevelFeedback key={i} {...levelFeedback} />;
      })}
    </div>
  );
}

const styles = {
  header: {
    marginBottom: 20,
  },
};

AllFeedbacks.propTypes = {
  feedbacksByLevel: PropTypes.arrayOf(levelFeedbackShape),
};

export default AllFeedbacks;
