import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import StudentGroup from './StudentGroup';
import color from '@cdo/apps/util/color';

export default function UnassignedStudentsPanel({unassignedGroup}) {
  return (
    <div style={styles.unassignedStudentsPanel}>
      <div style={styles.header}>
        <span>Unassigned Students</span>
        <Button
          onClick={() => {}}
          icon={'times'}
          text={'Unassign All'}
          color={'gray'}
        />
      </div>
      <div style={styles.groupsContainer}>
        <StudentGroup
          droppableId={unassignedGroup.droppableId}
          members={unassignedGroup.members}
        />
      </div>
    </div>
  );
}

UnassignedStudentsPanel.propTypes = {
  unassignedGroup: PropTypes.object.isRequired
};

export const HEADER_STYLE = {
  height: 54,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 5px',
  border: `1px solid ${color.lightest_gray}`,
  background: color.light_gray
};

const styles = {
  unassignedStudentsPanel: {
    width: 400
  },
  header: HEADER_STYLE
};
