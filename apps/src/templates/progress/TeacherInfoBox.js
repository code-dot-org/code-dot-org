import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';

const styles = {
  outer: {
    display: 'table-cell',
    verticalAlign: 'top',
    width: 200,
    height: '100%',
    borderRadius: 2
  },
  inner: {
    backgroundColor: color.lightest_cyan,
    height: '100%',
    borderWidth: 1,
    borderColor: color.cyan,
    borderStyle: 'solid',
    textAlign: 'center'
  }
};

/**
 * A component that is a simple blue box with info for teachers.
 */
const TeacherInfoBox = ({children}) => {
  if (children.length === 0) {
    return null;
  }
  return (
    <div style={styles.outer} className="teacher-info-box">
      <div style={styles.inner}>{children}</div>
    </div>
  );
};
TeacherInfoBox.propTypes = {
  children: PropTypes.node.isRequired
};

export default TeacherInfoBox;
