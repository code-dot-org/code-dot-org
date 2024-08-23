import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import harness from '@cdo/apps/lib/util/harness';
import {
  unassignSection,
  sectionName,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import UnassignSectionDialog from '@cdo/apps/templates/UnassignSectionDialog';
import i18n from '@cdo/locale';

const FIREHOSE_START_EVENT = 'start-course-unassigned-from-section';
const FIREHOSE_CANCEL_EVENT = 'cancel-course-unassigned-from-section';

/**
 * Removes null values from stringified object before sending firehose record
 */
function removeNullValues(key, val) {
  if (val === null || typeof val === 'undefined') {
    return undefined;
  }
  return val;
}

function UnassignSectionButton({
  sectionId,
  courseName,
  buttonLocationAnalytics,
  initialUnitId,
  initialCourseId,
  unassignSection,
  sectionName,
  isRtl,
}) {
  const [text, setText] = useState(i18n.assigned());
  const [icon, setIcon] = useState('check');
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);

  // Adjust styles if locale is RTL
  const buttonMarginStyle = isRtl
    ? styles.buttonMarginRTL
    : styles.buttonMargin;

  const onMouseOver = () => {
    setText(i18n.unassign());
    setIcon('times');
  };

  const onMouseOut = () => {
    setText(i18n.assigned());
    setIcon('check');
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
    unassignSection(sectionId, buttonLocationAnalytics);
  };

  const firehoseSendRecord = event => {
    harness.trackAnalytics(
      {
        study: 'assignment',
        event: event,
        data_json: JSON.stringify(
          {
            sectionId: sectionId,
            scriptId: initialUnitId,
            courseId: initialCourseId,
            location: buttonLocationAnalytics,
            date: new Date(),
          },
          removeNullValues
        ),
      },
      {includeUserId: true}
    );
  };

  return (
    <div
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseOut}
      style={buttonMarginStyle}
      className={'uitest-unassign-button'}
    >
      <Button
        style={styles.boxShadow}
        color={Button.ButtonColor.green}
        text={text}
        icon={icon}
        onClick={openUnassignDialog}
      />
      <UnassignSectionDialog
        isOpen={showUnassignDialog}
        sectionId={sectionId}
        courseName={courseName}
        sectionName={sectionName}
        onClose={closeUnassignDialog}
        cancelUnassign={cancelUnassign}
        unassignSection={confirmUnassign}
      />
    </div>
  );
}

UnassignSectionButton.propTypes = {
  sectionId: PropTypes.number.isRequired,
  courseName: PropTypes.string,
  buttonLocationAnalytics: PropTypes.string,
  // Redux
  initialUnitId: PropTypes.number,
  initialCourseId: PropTypes.number,
  unassignSection: PropTypes.func.isRequired,
  sectionName: PropTypes.string,
  isRtl: PropTypes.bool,
};

const styles = {
  buttonMargin: {
    marginLeft: 10,
    display: 'flex',
    alignItems: 'center',
  },
  buttonMarginRTL: {
    marginRight: 10,
    display: 'flex',
    alignItems: 'center',
  },
  boxShadow: {
    boxShadow: 'inset 0 2px 0 0 rgb(255 255 255 / 40%)',
  },
};

export const UnconnectedUnassignSectionButton = UnassignSectionButton;

export default connect(
  (state, props) => ({
    isRtl: state.isRtl,
    initialUnitId: state.teacherSections.initialUnitId,
    initialCourseId: state.teacherSections.initialCourseId,
    sectionName: sectionName(state, props.sectionId),
  }),
  {unassignSection}
)(UnassignSectionButton);
