import React, {useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import FontAwesome from './../FontAwesome';
import color from '../../util/color';
import {sectionForDropdownShape} from './shapes';
import {
  assignToSection,
  unassignSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import UnassignSectionDialog from '@cdo/apps/templates/UnassignSectionDialog';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const FIREHOSE_START_EVENT = 'start-course-unassigned-from-section';
const FIREHOSE_CANCEL_EVENT = 'cancel-course-unassigned-from-section';

/**
 * Removes null values from stringified object before sending firehose record
 */
function removeNullValues(key, val) {
  if (val === null || typeof val === undefined) {
    return undefined;
  }
  return val;
}

export function UnconnectedTeacherSectionSelectorMenuItem({
  section,
  onClick,
  courseName,
  courseId,
  unitId,
  courseOfferingId,
  courseVersionId,
  assignToSection,
  unassignSection,
  buttonLocationAnalytics
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);

  const getIcon = () => {
    if (isPending) {
      return <FontAwesome icon="spinner" style={styles.icon} />;
    }

    if (section.isAssigned && isHovering) {
      return (
        <FontAwesome icon="times" style={{...styles.icon, color: color.red}} />
      );
    }
    if (!section.isAssigned && !isHovering) {
      return <FontAwesome style={styles.icon} icon="square-o" />;
    }
    return (
      <FontAwesome
        style={{marginRight: 5, color: color.level_perfect}}
        icon="check"
      />
    );
  };

  const firehoseSendRecord = event => {
    firehoseClient.putRecord(
      {
        study: 'assignment',
        event: event,
        data_json: JSON.stringify(
          {
            sectionId: section.id,
            unitId: unitId,
            courseId: courseId,
            location: buttonLocationAnalytics,
            date: new Date()
          },
          removeNullValues
        )
      },
      {includeUserId: true}
    );
  };

  const openUnassignDialog = () => {
    setShowUnassignDialog(true);
    firehoseSendRecord(FIREHOSE_START_EVENT);
  };

  const closeUnassignDialog = () => {
    setShowUnassignDialog(false);
  };

  const cancelUnassign = () => {
    closeUnassignDialog();
    firehoseSendRecord(FIREHOSE_CANCEL_EVENT);
  };

  const confirmUnassign = () => {
    setIsPending(true);
    unassignSection(section.id, buttonLocationAnalytics).then(() =>
      setIsPending(false)
    );
  };

  const onAssignClick = e => {
    setIsPending(true);
    assignToSection(
      section.id,
      courseId,
      courseOfferingId,
      courseVersionId,
      unitId
    ).then(() => setIsPending(false));
  };

  const onIconClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) {
      return;
    }
    if (section.isAssigned) {
      openUnassignDialog();
    } else {
      onAssignClick(e);
    }
  };

  const onKeyDown = e => {
    if (e.key === 'Enter') {
      onIconClick(e);
    }
  };

  return (
    <>
      <PopUpMenu.Item onClick={onClick} style={styles.item}>
        <span
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={isPending ? null : onIconClick}
          onKeyDown={isPending ? null : onKeyDown}
          tabIndex="0"
          aria-label={
            section.isAssigned
              ? `Unassign course from ${section.name}`
              : `Assign course to ${section.name}`
          }
        >
          {getIcon()}
        </span>

        <span>{section.name}</span>
      </PopUpMenu.Item>
      <UnassignSectionDialog
        isOpen={showUnassignDialog}
        sectionId={section.id}
        courseName={courseName}
        sectionName={section.name}
        onClose={closeUnassignDialog}
        cancelUnassign={cancelUnassign}
        unassignSection={confirmUnassign}
      />
    </>
  );
}

UnconnectedTeacherSectionSelectorMenuItem.propTypes = {
  section: sectionForDropdownShape,
  onClick: PropTypes.func.isRequired,
  courseName: PropTypes.string,
  courseId: PropTypes.number,
  unitId: PropTypes.number,
  courseOfferingId: PropTypes.number,
  courseVersionId: PropTypes.number,
  assignToSection: PropTypes.func,
  unassignSection: PropTypes.func,
  buttonLocationAnalytics: PropTypes.string
};

const styles = {
  item: {
    height: 28,
    lineHeight: '28px',
    width: 270,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: 10
  },
  icon: {
    marginRight: 5,
    width: 11
  }
};

export default connect(
  () => ({}),
  {
    assignToSection,
    unassignSection
  }
)(UnconnectedTeacherSectionSelectorMenuItem);
