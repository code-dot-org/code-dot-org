import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import JavalabButton from '@cdo/apps/javalab/JavalabButton';
import StudentGroup from './StudentGroup';
import {
  HEADER_STYLE,
  BUTTON_STYLE,
  GROUPS_CONTAINER_STYLE
} from './UnassignedStudentsPanel';

export default function AssignedStudentsPanel({groups, onCreateGroupClick}) {
  // TO DO: style and add small pop-up to get group name from teacher when creating a group.
  // https://codedotorg.atlassian.net/browse/CSA-1033
  return (
    <div style={styles.groupsPanel}>
      <div style={styles.header}>
        <span>{i18n.groups()}</span>
        <JavalabButton
          onClick={onCreateGroupClick}
          icon={<FontAwesome icon="plus" className="fa" />}
          text={i18n.createGroup()}
          style={styles.button}
          isHorizontal
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
  button: BUTTON_STYLE,
  groupsContainer: GROUPS_CONTAINER_STYLE
};
