import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import CodeReviewGroup from './CodeReviewGroup';

import moduleStyles from './studentGroupsPanel.module.scss';

export default function AssignedStudentsPanel({
  groups,
  onCreateGroupClick,
  onGroupNameUpdate,
  onGroupDelete,
}) {
  // TO DO: style and add small pop-up to get group name from teacher when creating a group.
  // https://codedotorg.atlassian.net/browse/CSA-1033
  return (
    <div className={moduleStyles.groupsPanel}>
      <div className={moduleStyles.header}>
        <span className={moduleStyles.headerTitle}>{i18n.groups()}</span>
        <MuiButton
          id="uitest-create-code-review-group"
          variant="outlined"
          color="tertiary"
          size="small"
          onClick={onCreateGroupClick}
          type="button"
          startIcon={<FontAwesomeV6Icon iconName="plus" />}
        >
          {i18n.createGroup()}
        </MuiButton>
      </div>
      <div className={moduleStyles.groupsContainer}>
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
