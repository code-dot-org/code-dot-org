import PropTypes from 'prop-types';
import React from 'react';

import JavalabButton from '@cdo/apps/javalab/JavalabButton';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import i18n from '@cdo/locale';

import CodeReviewGroup from './CodeReviewGroup';
import {
  HEADER_STYLE,
  BUTTON_STYLE,
  GROUPS_CONTAINER_STYLE,
  HEADER_TITLE_STYLE,
} from './UnassignedStudentsPanel';

export default function AssignedStudentsPanel({
  groups,
  onCreateGroupClick,
  onGroupNameUpdate,
  onGroupDelete,
}) {
  // TO DO: style and add small pop-up to get group name from teacher when creating a group.
  // https://codedotorg.atlassian.net/browse/CSA-1033
  return (
    <div style={styles.groupsPanel}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>{i18n.groups()}</span>
        <JavalabButton
          id="uitest-create-code-review-group"
          onClick={onCreateGroupClick}
          icon={<FontAwesome icon="plus" className="fa" />}
          text={i18n.createGroup()}
          inlineStyle={styles.button}
          isHorizontal
        />
      </div>
      <div style={styles.groupsContainer}>
        {groups.map(group => {
          return (
            <CodeReviewGroup
              droppableId={group.droppableId}
              members={group.members}
              key={group.droppableId}
              name={group.name}
              onNameUpdate={onGroupNameUpdate}
              onDelete={onGroupDelete}
            />
          );
        })}
      </div>
    </div>
  );
}

AssignedStudentsPanel.propTypes = {
  groups: PropTypes.array.isRequired,
  onCreateGroupClick: PropTypes.func.isRequired,
  onGroupNameUpdate: PropTypes.func.isRequired,
  onGroupDelete: PropTypes.func.isRequired,
};

const styles = {
  groupsPanel: {
    width: 500,
  },
  header: HEADER_STYLE,
  headerTitle: HEADER_TITLE_STYLE,
  button: BUTTON_STYLE,
  groupsContainer: GROUPS_CONTAINER_STYLE,
};
