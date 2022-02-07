import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import JavalabButton from '@cdo/apps/javalab/JavalabButton';
import StudentGroup from './StudentGroup';

export default function UnassignedStudentsPanel({
  unassignedGroup,
  onUnassignAllClick
}) {
  // TO DO: implement unassigning students and style
  // https://codedotorg.atlassian.net/browse/CSA-1028
  return (
    <div style={styles.unassignedStudentsPanel}>
      <div style={styles.header}>
        <span>{i18n.unassignedStudents()}</span>
        <JavalabButton
          id="uitest-unassign-all-button"
          onClick={onUnassignAllClick}
          icon={<FontAwesome icon="times" className="fa" />}
          text={i18n.unassignAll()}
          style={styles.button}
          isHorizontal
        />
      </div>
      <div style={styles.groupsContainer}>
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
  onUnassignAllClick: PropTypes.func.isRequired
};

export const HEADER_STYLE = {
  height: 54,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '5px 10px 5px 5px',
  border: `1px solid ${color.lighter_gray}`,
  background: color.lightest_gray,
  fontFamily: '"Gotham 5r", sans-serif',
  fontSize: 14
};

export const BUTTON_STYLE = {
  backgroundColor: color.lightest_gray,
  color: color.dark_charcoal,
  borderRadius: 4,
  border: `1px solid ${color.dark_charcoal}`,
  fontSize: 14
};

export const GROUPS_CONTAINER_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  height: 355,
  overflow: 'auto',
  border: `1px solid ${color.lightest_gray}`,
  padding: '10px 4px 0 0'
};

const styles = {
  unassignedStudentsPanel: {
    width: 400
  },
  header: HEADER_STYLE,
  button: BUTTON_STYLE,
  groupsContainer: GROUPS_CONTAINER_STYLE,
  studentGroup: {
    height: 355
  }
};
