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
    $.ajax({
      type: 'DELETE',
      url: `/lessons/${lessonId}`
    }).success(() => {
      window.location.reload();
    });
  };

  return (
    <FontAwesome icon={'trash'} style={styles.icon} onClick={handleClick} />
  );
};

OwnedLesson.propTypes = {
  lessonId: PropTypes.number.isRequired
};

export default OwnedLesson;
