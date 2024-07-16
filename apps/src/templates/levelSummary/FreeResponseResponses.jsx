import PropTypes from 'prop-types';
import React from 'react';

import ResponseMenuDropdown from './ResponseMenuDropdown';

import styles from './summary.module.scss';

const FreeResponseResponses = ({responses}) => {
  return (
    <div className={styles.studentResponsesColumns}>
      {responses.map(response => (
        <div key={response.user_id} className={styles.studentAnswer}>
          <p>{response.text}</p>
          <ResponseMenuDropdown response={response} />
        </div>
      ))}
    </div>
  );
};

FreeResponseResponses.propTypes = {
  responses: PropTypes.arrayOf(PropTypes.object),
};

export default FreeResponseResponses;
