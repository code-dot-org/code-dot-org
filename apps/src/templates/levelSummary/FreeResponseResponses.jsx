import PropTypes from 'prop-types';
import React from 'react';

import styles from './summary.module.scss';

const FreeResponseResponses = ({responses}) => (
  <div className={styles.studentResponsesColumns}>
    {responses.map(response => (
      <div key={response.user_id}>
        <div className={styles.studentAnswer}>
          <p>{response.text}</p>
        </div>
        <div className={styles.studentAnswer}>
          <p>{response.user_id}</p>
        </div>
      </div>
    ))}
  </div>
);

FreeResponseResponses.propTypes = {
  responses: PropTypes.arrayOf(PropTypes.object),
};

export default FreeResponseResponses;
