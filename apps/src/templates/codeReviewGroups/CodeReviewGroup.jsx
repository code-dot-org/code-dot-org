import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import StudentGroup from './StudentGroup';

export default function CodeReviewGroup({
  droppableId,
  members,
  name,
  onNameUpdate,
  onDelete,
}) {
  const handleNameUpdate = event => {
    onNameUpdate(droppableId, event.target.value);
  };
  return (
    <div style={styles.groupContainer} className="uitest-code-review-group">
      <div style={styles.headerContainer}>
        <input
          value={name}
          style={styles.nameInput}
          onChange={handleNameUpdate}
          placeholder={i18n.enterGroupName()}
        />
        <button
          style={styles.deleteButtonContainer}
          onClick={() => onDelete(droppableId)}
          type={'button'}
          aria-label={i18n.deleteGroup()}
        >
          <FontAwesome icon={'trash'} style={styles.deleteButton} />
        </button>
      </div>
      <StudentGroup
        droppableId={droppableId}
        members={members}
        key={droppableId}
        showEmptyGroupPlaceholder={true}
      />
    </div>
  );
}

CodeReviewGroup.propTypes = {
  droppableId: PropTypes.string.isRequired,
  members: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  onNameUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const styles = {
  groupContainer: {
    paddingBottom: 20,
    paddingLeft: 5,
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    border: `1px solid ${color.lighter_gray}`,
    background: color.lightest_gray,
    padding: '9px 12px',
  },
  nameInput: {
    padding: '5px 12px',
    borderRadius: 4,
    border: `1px solid ${color.lighter_gray}`,
    width: '210px',
  },
  deleteButtonContainer: {
    display: 'flex',
    border: `1px solid ${color.dark_charcoal}`,
    borderRadius: 4,
    margin: 0,
  },
};
