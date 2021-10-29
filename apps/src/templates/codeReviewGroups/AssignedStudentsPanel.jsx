import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import StudentGroup from './StudentGroup';
import color from '@cdo/apps/util/color';
import {HEADER_STYLE} from './UnassignedStudentsPanel';

export default function AssignedStudentsPanel({groups, onCreateGroupClick}) {
  return (
    <div style={styles.groupsPanel}>
      <div style={styles.header}>
        <span>Groups</span>
        <Button
          onClick={onCreateGroupClick}
          icon={'plus'}
          text={'Create Group'}
          color={'gray'}
        />
      </div>
      <div style={styles.groupsContainer}>
        {groups.map(group => {
          return (
            <StudentGroup
              droppableId={group.droppableId}
              members={group.members}
              key={group.droppableId}
            />
          );
        })}
      </div>
    </div>
  );
}

AssignedStudentsPanel.propTypes = {
  groups: PropTypes.array.isRequired,
  onCreateGroupClick: PropTypes.func.isRequired
};

const styles = {
  groupsPanel: {
    width: 500
  },
  header: HEADER_STYLE,
  groupsContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 355,
    overflow: 'scroll',
    border: `1px solid ${color.lightest_gray}`
  }
};
