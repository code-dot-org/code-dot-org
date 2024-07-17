import PropTypes from 'prop-types';
import React from 'react';

import ResponseMenuDropdown from './ResponseMenuDropdown';

import styles from './summary.module.scss';

const FreeResponseResponses = ({responses, showStudentNames}) => {
  return (
    <div className={styles.studentResponsesColumns}>
      {responses.map(response => (
        <div key={response.user_id}>
          <div className={styles.studentAnswer}>
            <p>{response.text}</p>
            <ResponseMenuDropdown response={response} />
          </div>
          <div className={styles.studentName}>
            {showStudentNames && <p>{response.student_name}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

FreeResponseResponses.propTypes = {
  responses: PropTypes.arrayOf(PropTypes.object),
  showStudentNames: PropTypes.bool,
};

export default FreeResponseResponses;
