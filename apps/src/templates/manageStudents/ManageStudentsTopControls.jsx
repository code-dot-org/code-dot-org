import PropTypes from 'prop-types';
import React from 'react';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import AddMultipleStudents from './AddMultipleStudents';
import MoveStudents from './MoveStudents';
import DownloadParentLetter from './DownloadParentLetter';
import PrintLoginCards from './PrintLoginCards';
import {
  studentSectionDataPropType,
  ParentLetterButtonMetricsCategory,
  PrintLoginCardsButtonMetricsCategory
} from './manageStudentsTypes';

const ManageStudentsTopControls = ({
  sectionId,
  loginType,
  studentData,
  transferStatus,
  transferData
}) => {
  return (
    <React.Fragment>
      {(loginType === SectionLoginType.word ||
        loginType === SectionLoginType.picture) && (
        <div style={styles.buttonWithMargin}>
          <AddMultipleStudents sectionId={sectionId} />
        </div>
      )}
      {canMoveStudents(loginType) && (
        <div style={styles.button}>
          <MoveStudents
            studentData={studentData.filter(student => !student.isEditing)}
            transferData={transferData}
            transferStatus={transferStatus}
          />
        </div>
      )}
      {(loginType === SectionLoginType.word ||
        loginType === SectionLoginType.picture) && (
        <div style={styles.button}>
          <PrintLoginCards
            sectionId={sectionId}
            entryPointForMetrics={
              PrintLoginCardsButtonMetricsCategory.MANAGE_STUDENTS
            }
            onPrintLoginCards={() => printLoginCards(sectionId)}
          />
        </div>
      )}
      <div style={styles.button}>
        <DownloadParentLetter
          sectionId={sectionId}
          buttonMetricsCategory={ParentLetterButtonMetricsCategory.ABOVE_TABLE}
        />
      </div>
    </React.Fragment>
  );
};
ManageStudentsTopControls.propTypes = {
  sectionId: PropTypes.string.isRequired,
  loginType: PropTypes.string,
  studentData: PropTypes.arrayOf(studentSectionDataPropType),
  transferData: PropTypes.object,
  transferStatus: PropTypes.object
};

export default ManageStudentsTopControls;

const canMoveStudents = loginType =>
  loginType === SectionLoginType.word ||
  loginType === SectionLoginType.picture ||
  loginType === SectionLoginType.email;

const printLoginCards = sectionId => {
  const url = teacherDashboardUrl(sectionId, '/login_info') + `?autoPrint=true`;
  window.open(url, '_blank');
};

const styles = {
  button: {
    float: 'left'
  },
  buttonWithMargin: {
    marginRight: 5,
    float: 'left'
  }
};
