import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SafeMarkdown from '../SafeMarkdown';
import Notification, {NotificationType} from '../Notification';
import {AddStatus, TransferStatus, TransferType} from './manageStudentsTypes';

const ManageStudentsNotifications = ({addStatus, transferStatus}) => {
  return (
    <React.Fragment>
      {addStatus.status === AddStatus.SUCCESS && (
        <Notification
          type={NotificationType.success}
          notice={i18n.manageStudentsNotificationSuccess()}
          details={i18n.manageStudentsNotificationAddSuccess({
            numStudents: addStatus.numStudents
          })}
          dismissible={false}
        />
      )}
      {addStatus.status === AddStatus.FULL && (
        <ManageStudentsNotificationFull manageStatus={addStatus} />
      )}
      {transferStatus.status === TransferStatus.FULL && (
        <ManageStudentsNotificationFull manageStatus={transferStatus} />
      )}
      {addStatus.status === AddStatus.FAIL && (
        <Notification
          type={NotificationType.failure}
          notice={i18n.manageStudentsNotificationFailure()}
          details={i18n.manageStudentsNotificationCannotAdd({
            numStudents: addStatus.numStudents
          })}
          dismissible={false}
        />
      )}
      {transferStatus.status === TransferStatus.SUCCESS && (
        <TransferSuccessNotification {...transferStatus} />
      )}
    </React.Fragment>
  );
};
ManageStudentsNotifications.propTypes = {
  addStatus: PropTypes.object,
  transferStatus: PropTypes.object
};

export default ManageStudentsNotifications;

const ManageStudentsNotificationFull = ({manageStatus}) => {
  const {sectionCapacity, sectionCode, sectionStudentCount} = manageStatus;

  const sectionSpotsRemaining =
    sectionCapacity - sectionStudentCount > 0
      ? sectionCapacity - sectionStudentCount
      : 0;

  const notificationParams = {
    studentLimit: sectionCapacity,
    currentStudentCount: sectionStudentCount,
    sectionCode: sectionCode,
    availableSpace: sectionSpotsRemaining
  };

  const notification = {
    notice: i18n.manageStudentsNotificationCannotVerb({
      numStudents: manageStatus.numStudents,
      verb: manageStatus.verb || 'add'
    }),
    details: `${
      sectionSpotsRemaining === 0
        ? i18n.manageStudentsNotificationFull(notificationParams)
        : i18n.manageStudentsNotificationWillBecomeFull(notificationParams)
    } 
          ${i18n.contactSupportFullSection({
            supportLink: 'https://support.code.org/hc/en-us/requests/new'
          })}`
  };

  return (
    <Notification
      type={NotificationType.failure}
      notice={notification.notice}
      details={
        // SafeMarkedown required to convert i18n string to clickable link
        <SafeMarkdown markdown={notification.details} />
      }
      dismissible={false}
    />
  );
};
ManageStudentsNotificationFull.propTypes = {
  manageStatus: PropTypes.object.isRequired
};

const TransferSuccessNotification = ({type, numStudents, sectionDisplay}) => {
  let notification = {};

  switch (type) {
    case TransferType.MOVE_STUDENTS:
      notification.notice = i18n.studentsSuccessfullyMovedNotice;
      notification.details = i18n.studentsSuccessfullyMovedDetails;
      break;
    case TransferType.COPY_STUDENTS:
      notification.notice = i18n.studentsSuccessfullyCopiedNotice;
      notification.details = i18n.studentsSuccessfullyCopiedDetails;
      break;
  }

  return (
    <Notification
      type={NotificationType.success}
      notice={notification.notice()}
      details={notification.details({
        numStudents: numStudents,
        section: sectionDisplay
      })}
      dismissible={false}
    />
  );
};
TransferSuccessNotification.propTypes = {
  type: PropTypes.oneOf(Object.keys(TransferType)).isRequired,
  numStudents: PropTypes.number.isRequired,
  sectionDisplay: PropTypes.any // what is this?
};
