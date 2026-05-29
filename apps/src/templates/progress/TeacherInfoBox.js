import PropTypes from 'prop-types';
import React from 'react';

import styles from './teacherInfoBox.module.scss';

/**
 * A component that is a simple blue box with info for teachers.
 */
const TeacherInfoBox = ({children}) => {
  if (children.length === 0) {
    return null;
  }
  return (
    <div className={`${styles.outer} teacher-info-box`}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
};
TeacherInfoBox.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TeacherInfoBox;
