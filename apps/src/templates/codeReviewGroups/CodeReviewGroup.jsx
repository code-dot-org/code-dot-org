import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {IconButton as MuiIconButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import StudentGroup from './StudentGroup';

import moduleStyles from './codeReviewGroup.module.scss';

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
    <div className={`${moduleStyles.groupContainer} uitest-code-review-group`}>
      <div className={moduleStyles.headerContainer}>
        <TextField
          name={`code-review-group-name-${droppableId}`}
          value={name}
          onChange={handleNameUpdate}
          placeholder={i18n.enterGroupName()}
          aria-label={i18n.enterGroupName()}
          size="s"
          className={moduleStyles.nameInput}
        />
        <MuiIconButton
          variant="outlined"
          color="tertiary"
          size="small"
          onClick={() => onDelete(droppableId)}
          type="button"
          aria-label={i18n.deleteGroup()}
        >
          <FontAwesomeV6Icon iconName="trash" iconStyle="solid" />
        </MuiIconButton>
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
