import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '../FontAwesome';
import color from '@cdo/apps/util/color';
import StudentGroup from './StudentGroup';

export default function CodeReviewGroup({
  droppableId,
  members,
  name,
  onNameUpdate,
  onDelete
}) {
  const handleNameUpdate = event => {
    //preventdefault?
    onNameUpdate(droppableId, event.target.value);
  };
  return (
    <div>
      <div style={styles.headerContainer}>
        <input
          value={name}
          style={styles.nameInput}
          onChange={handleNameUpdate}
        />
        <button
          style={styles.deleteButtonContainer}
          onClick={() => onDelete(droppableId)}
          type={'button'}
        >
          <FontAwesome icon={'trash'} style={styles.deleteButton} />
        </button>
      </div>
      <StudentGroup
        droppableId={droppableId}
        members={members}
        key={droppableId}
      />
    </div>
  );
}

CodeReviewGroup.propTypes = {
  droppableId: PropTypes.string.isRequired,
  members: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  onNameUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

const styles = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    border: '1px solid black',
    background: color.lightest_gray,
    padding: '9px 12px'
  },
  nameInput: {borderRadius: 4},
  deleteButtonContainer: {display: 'flex'},
  deleteButton: {padding: 10}
};
