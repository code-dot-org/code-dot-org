import type {InferProps} from 'prop-types';
import React, {useState} from 'react';

import RubricContent from '@cdo/apps/templates/rubrics/RubricContent';
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
  // These map directly to RubricContent props so we can reuse it as-is.
  rubric: Rubric;
  studentLevelInfo?: StudentLevelInfo;
  teacherHasEnabledAi?: boolean;
  canProvideFeedback?: boolean;
  onLevelForEvaluation?: boolean;
  reportingData?: ReportingData;
  aiEvaluations?: AiEvaluation[];
  sectionId?: number;
  reloadOnStudentChange?: boolean;
}

/**
 * Teacher-style rubric widget for the Student Snapshot dashboard.
 *
 * This widget reuses the existing teacher rubric content component:
 * - RubricContent: lesson header, student metadata, learning goals, evidence levels,
 *   and teacher feedback.
 *
 * The widget itself is intentionally thin: it wraps RubricContent in the
 * Student Snapshot WidgetTemplate and owns only local UI state that
 * RubricContent expects (e.g. feedbackAdded).
 */
const StudentRubricWidget: React.FC<StudentRubricWidgetProps> = ({
  gridWidth = 2,
  gridHeight = 2,
  rubric,
  studentLevelInfo,
  teacherHasEnabledAi = false,
  canProvideFeedback = true,
  onLevelForEvaluation = true,
  reportingData,
  aiEvaluations,
  sectionId,
  reloadOnStudentChange = false,
}) => {
  const [feedbackAdded, setFeedbackAdded] = useState(false);

  return (
    <WidgetTemplate
      widgetName="Rubric"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      scrollable={true}
    >
      <RubricContent
        productTour={false}
        rubric={rubric}
        open={true}
        teacherHasEnabledAi={teacherHasEnabledAi}
        canProvideFeedback={canProvideFeedback}
        onLevelForEvaluation={onLevelForEvaluation}
        reportingData={reportingData}
        visible={true}
        aiEvaluations={aiEvaluations}
        feedbackAdded={feedbackAdded}
        setFeedbackAdded={setFeedbackAdded}
        studentLevelInfo={studentLevelInfo}
        sectionId={sectionId}
        reloadOnStudentChange={reloadOnStudentChange}
      />
    </WidgetTemplate>
  );
};

export default StudentRubricWidget;
