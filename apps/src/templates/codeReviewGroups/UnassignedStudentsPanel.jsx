import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import StudentGroup from './StudentGroup';

import moduleStyles from './studentGroupsPanel.module.scss';

export default function UnassignedStudentsPanel({
  unassignedGroup,
  onUnassignAllClick,
}) {
  return (
    <div className={moduleStyles.unassignedStudentsPanel}>
      <div className={moduleStyles.header}>
        <span className={moduleStyles.headerTitle}>
          {i18n.unassignedStudents()}
        </span>
        <MuiButton
          id="uitest-unassign-all-button"
          variant="outlined"
          color="tertiary"
          size="small"
          onClick={onUnassignAllClick}
          type="button"
          startIcon={<FontAwesomeV6Icon iconName="xmark" />}
        >
          {i18n.unassignAll()}
        </MuiButton>
      </div>
      <div
        id="uitest-code-review-group-unassigned"
        className={moduleStyles.groupsContainer}
      >
        <StudentGroup
          droppableId={unassignedGroup.droppableId}
          members={unassignedGroup.members}
          dropAreaStyle={{height: 355}}
          showEmptyGroupPlaceholder={false}
        />
      </div>
    </div>
  );
}

UnassignedStudentsPanel.propTypes = {
  unassignedGroup: PropTypes.object.isRequired,
  onUnassignAllClick: PropTypes.func.isRequired,
};
