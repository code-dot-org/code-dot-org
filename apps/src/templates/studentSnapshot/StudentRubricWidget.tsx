import type {InferProps} from 'prop-types';
import React, {useState} from 'react';

import LearningGoals from '@cdo/apps/templates/rubrics/LearningGoals';
import {aiEvaluationShape} from '@cdo/apps/templates/rubrics/rubricShapes';
import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';
import type {
  Rubric,
  StudentLevelInfo,
  ReportingData,
} from '@cdo/apps/types/rubricTypes';

type AiEvaluation = InferProps<typeof aiEvaluationShape>['isRequired'];

interface StudentRubricWidgetProps {
  gridWidth?: number;
  gridHeight?: number;
  // These map directly to LearningGoals props so we can reuse it as-is.
  rubric: Rubric;
  studentLevelInfo?: StudentLevelInfo;
  teacherHasEnabledAi?: boolean;
  canProvideFeedback?: boolean;
  reportingData?: ReportingData;
  aiEvaluations?: AiEvaluation[];
}

/**
 * Teacher-style rubric widget for the Student Snapshot dashboard.
 *
 * This widget reuses the existing LearningGoals component from the rubric system:
 * - LearningGoals: learning goals navigation, evidence levels, and teacher feedback.
 *
 * The widget itself is intentionally thin: it wraps LearningGoals in the
 * Student Snapshot WidgetTemplate and owns only local UI state that
 * LearningGoals expects (e.g. feedbackAdded).
 */
const StudentRubricWidget: React.FC<StudentRubricWidgetProps> = ({
  gridWidth = 2,
  gridHeight = 2,
  rubric,
  studentLevelInfo,
  teacherHasEnabledAi = false,
  canProvideFeedback = true,
  reportingData,
  aiEvaluations,
}) => {
  const [feedbackAdded, setFeedbackAdded] = useState(false);

  if (!rubric.learningGoals) {
    return (
      <WidgetTemplate
        widgetName="Rubric"
        gridWidth={gridWidth}
        gridHeight={gridHeight}
      >
        <div>No rubric data available.</div>
      </WidgetTemplate>
    );
  }

  return (
    <WidgetTemplate
      widgetName="Rubric"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
    >
      <LearningGoals
        productTour={false}
        open={true}
        learningGoals={rubric.learningGoals}
        teacherHasEnabledAi={teacherHasEnabledAi}
        canProvideFeedback={canProvideFeedback}
        reportingData={reportingData}
        studentLevelInfo={studentLevelInfo}
        submittedEvaluation={undefined}
        isStudent={false}
        feedbackAdded={feedbackAdded}
        setFeedbackAdded={setFeedbackAdded}
        aiEvaluations={aiEvaluations}
      />
    </WidgetTemplate>
  );
};

export default StudentRubricWidget;
