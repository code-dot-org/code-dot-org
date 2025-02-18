import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import JavalabButton from '@cdo/apps/javalab/JavalabButton';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import StudentGroup from './StudentGroup';

export default function UnassignedStudentsPanel({
  unassignedGroup,
  onUnassignAllClick,
}) {
  return (
    <div style={styles.unassignedStudentsPanel}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>{i18n.unassignedStudents()}</span>
        <JavalabButton
          id="uitest-unassign-all-button"
          onClick={onUnassignAllClick}
          icon={<FontAwesome icon="times" className="fa" />}
          text={i18n.unassignAll()}
          inlineStyle={styles.button}
          isHorizontal
        />
      </div>
      <div
        id="uitest-code-review-group-unassigned"
        style={styles.groupsContainer}
      >
        <StudentGroup
          droppableId={unassignedGroup.droppableId}
          members={unassignedGroup.members}
          dropAreaStyle={styles.studentGroup}
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

export const HEADER_STYLE = {
  height: 54,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '5px 10px',
  border: `1px solid ${color.lighter_gray}`,
  background: color.lightest_gray,
  ...fontConstants['main-font-semi-bold'],
  fontSize: 14,
};

export const HEADER_TITLE_STYLE = {
  margin: '5px',
};

export const BUTTON_STYLE = {
  backgroundColor: color.lightest_gray,
  color: color.dark_charcoal,
  borderRadius: 4,
  border: `1px solid ${color.dark_charcoal}`,
  fontSize: 14,
};

export const GROUPS_CONTAINER_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  height: 355,
  overflow: 'auto',
  border: `1px solid ${color.lightest_gray}`,
  padding: '10px 4px 0 0',
};

const styles = {
  unassignedStudentsPanel: {
    width: 400,
  },
  header: HEADER_STYLE,
  headerTitle: HEADER_TITLE_STYLE,
  button: BUTTON_STYLE,
  groupsContainer: GROUPS_CONTAINER_STYLE,
  studentGroup: {
    height: 355,
  },
};
