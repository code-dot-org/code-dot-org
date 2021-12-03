import React from 'react';
import TeacherFeedback from '@cdo/apps/templates/instructions/teacherFeedback/TeacherFeedback';
import ReadonlyTeacherFeedback from '@cdo/apps/templates/instructions/teacherFeedback/ReadonlyTeacherFeedback';
import {
  teacherFeedbackShape,
  rubricShape
} from '@cdo/apps/templates/instructions/teacherFeedback/types';
import PropTypes from 'prop-types';

const TeacherFeedbackTab = ({
  teacherViewingStudentWork,
  displayReviewTab,
  visible,
  rubric,
  latestFeedback,
  token,
  serverScriptId,
  serverLevelId,
  teacher,
  innerRef
}) => {
  const renderEditableFeedback = teacherViewingStudentWork && !displayReviewTab;
  const renderReadonlyFeedback =
    !teacherViewingStudentWork && (!!rubric || !!latestFeedback);

  return (
    <div>
      {renderEditableFeedback && (
        <TeacherFeedback
          visible={visible}
          rubric={rubric}
          latestFeedback={latestFeedback}
          token={token}
          ref={innerRef}
          serverScriptId={serverScriptId}
          serverLevelId={serverLevelId}
          teacher={teacher}
        />
      )}
      {renderReadonlyFeedback && (
        <ReadonlyTeacherFeedback
          visible={visible}
          rubric={rubric}
          ref={innerRef}
          latestFeedback={latestFeedback}
        />
      )}
    </div>
  );
};

TeacherFeedbackTab.propTypes = {
  teacherViewingStudentWork: PropTypes.bool.isRequired,
  displayReviewTab: PropTypes.bool,
  visible: PropTypes.bool.isRequired,
  rubric: rubricShape,
  serverScriptId: PropTypes.number,
  serverLevelId: PropTypes.number,
  teacher: PropTypes.number,
  latestFeedback: teacherFeedbackShape,
  token: PropTypes.string,
  innerRef: PropTypes.func
};

export default TeacherFeedbackTab;
