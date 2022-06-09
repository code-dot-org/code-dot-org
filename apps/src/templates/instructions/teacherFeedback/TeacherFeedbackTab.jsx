import React from 'react';
import EditableTeacherFeedback from '@cdo/apps/templates/instructions/teacherFeedback/EditableTeacherFeedback';
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
  // If the teacher is viewing student work and there is no review tab (CSA peer review v1)
  // then the teacher is able to leave feedback for the student (editable feedback)
  const renderEditableFeedback = teacherViewingStudentWork && !displayReviewTab;

  // If the teacher isn't viewing student work then display feedback tab content
  // if there is a rubric or feedback has been given to the user
  const renderReadonlyFeedback =
    !teacherViewingStudentWork && (!!rubric || !!latestFeedback);

  return (
    <div>
      {renderEditableFeedback && (
        <EditableTeacherFeedback
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
