import React from 'react';
import PropTypes from 'prop-types';
import styles from './summary.module.scss';

const FreeResponseResponses = ({responses}) => (
  <div className={styles.studentResponsesColumns}>
    {responses.map(response => (
      <div key={response.user_id} className={styles.studentAnswer}>
        <p>{response.text}</p>
      </div>
    ))}
  </div>
);

FreeResponseResponses.propTypes = {
  responses: PropTypes.arrayOf(PropTypes.object),
};

export default FreeResponseResponses;
