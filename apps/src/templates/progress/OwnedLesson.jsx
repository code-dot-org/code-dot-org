import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '../FontAwesome';
import color from '../../util/color';

const styles = {
  icon: {
    fontSize: 24,
    color: color.dark_red,
    cursor: 'pointer'
  }
};

const OwnedLesson = ({lessonId}) => {
  const handleClick = () => {
    console.log('handleClick', lessonId);
  };

  return (
    <FontAwesome icon={'trash'} style={styles.icon} onClick={handleClick} />
  );
};

OwnedLesson.propTypes = {
  lessonId: PropTypes.number.isRequired
};

export default OwnedLesson;
