import {Typography} from '@mui/material';
import type {InferProps} from 'prop-types';
import React, {useEffect, useState} from 'react';

import LearningGoals from '@cdo/apps/templates/rubrics/LearningGoals';
import {aiEvaluationShape} from '@cdo/apps/templates/rubrics/rubricShapes';
import RubricSubmitFooter from '@cdo/apps/templates/rubrics/RubricSubmitFooter';
import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';
import type {
  Rubric,
  StudentLevelInfo,
  ReportingData,
} from '@cdo/apps/types/rubricTypes';
import HttpClient from '@cdo/apps/util/HttpClient';

import styles from './studentRubricWidget.module.scss';

type AiEvaluation = InferProps<typeof aiEvaluationShape>['isRequired'];

interface StudentRubricWidgetProps {
  gridWidth?: number;
  gridHeight?: number;
  lessonId: number | null;
  studentId: number | null;
  studentName?: string; // Optional - student name for display in AiAssessment
  levelId?: number; // Optional - if not provided, uses lesson.rubric (first rubric for lesson)
  // These map directly to LearningGoals props so we can reuse it as-is.
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
 * The widget handles its own data fetching, loading, and error states.
 */
const StudentRubricWidget: React.FC<StudentRubricWidgetProps> = ({
  gridWidth = 2,
  gridHeight = 2,
  lessonId,
  studentId,
  studentName = 'Student',
  levelId,
  studentLevelInfo,
  teacherHasEnabledAi = false,
  canProvideFeedback = true,
  reportingData,
  aiEvaluations,
}) => {
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackAdded, setFeedbackAdded] = useState(false);

  // Create minimal studentLevelInfo - only user_id is required
  // LearningGoals uses:
  // - user_id: Required - used for API calls (autosave, fetching evaluations, analytics)
  // - name: Optional - passed to AiAssessment as studentName prop
  // To add more student info from Redux in the future:
  // - Lesson progress: state.sectionProgress.studentLessonProgressByUnit[unitId][studentId][lessonId]
  //   - Contains: timeSpent (number), lastTimestamp (number, Unix seconds)
  // - Level progress: state.sectionProgress.studentLevelProgressByUnit[unitId][studentId][levelId]
  //   - Contains: timeSpent (number), lastTimestamp (number, Unix seconds), status, result, etc.
  //
  // OR pass studentLevelInfo with full date instead of individual studentId/studentName props.
  const effectiveStudentLevelInfo: StudentLevelInfo = studentLevelInfo || {
    user_id: studentId,
    name: studentName,
  };

  useEffect(() => {
    if (!lessonId) {
      // Show loading/skeleton state when no lesson is provided
      setIsLoading(true);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch rubric by lesson_id (and optionally level_id)
        const params = new URLSearchParams({lesson_id: lessonId.toString()});
        if (levelId) {
          params.append('level_id', levelId.toString());
        }
        const rubricResponse = await HttpClient.fetchJson<{
          rubricId: number;
          rubric: Rubric;
          levelId: number;
        }>(`/rubrics/find?${params.toString()}`);

        if (rubricResponse.value?.rubric) {
          setRubric(rubricResponse.value.rubric);
        } else {
          setError("This lesson doesn't have a rubric.");
        }
      } catch (err) {
        console.error('Failed to fetch rubric data:', err);
        setError("This lesson doesn't have a rubric.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lessonId, levelId, studentId, studentLevelInfo]);

  // Determine widget content based on state
  let widgetContent: React.ReactNode;
  let scrollable = false;

  if (isLoading) {
    widgetContent = (
      <Typography variant="body3" gutterBottom>
        Loading rubric...
      </Typography>
    );
  } else if (error) {
    widgetContent = (
      <Typography variant="body3" gutterBottom>
        {error}
      </Typography>
    );
  } else if (
    !rubric ||
    !rubric.learningGoals ||
    rubric.learningGoals.length === 0
  ) {
    widgetContent = (
      <Typography variant="body3" gutterBottom>
        This lesson doesn't have a rubric.
      </Typography>
    );
  } else {
    scrollable = true;
    widgetContent = (
      <div className={styles.studentRubricWidgetContent}>
        <LearningGoals
          productTour={false}
          open={true}
          learningGoals={rubric.learningGoals}
          teacherHasEnabledAi={teacherHasEnabledAi}
          canProvideFeedback={canProvideFeedback}
          reportingData={reportingData}
          studentLevelInfo={effectiveStudentLevelInfo}
          submittedEvaluation={undefined}
          isStudent={false}
          feedbackAdded={feedbackAdded}
          setFeedbackAdded={setFeedbackAdded}
          aiEvaluations={aiEvaluations}
        />
        {canProvideFeedback &&
          effectiveStudentLevelInfo?.user_id &&
          rubric.script?.id &&
          rubric.level?.id && (
            <div className={styles.studentRubricWidgetSubmitFooterContainer}>
              <RubricSubmitFooter
                rubric={rubric}
                reportingData={reportingData}
                studentLevelInfo={effectiveStudentLevelInfo}
                open={true}
                feedbackAdded={feedbackAdded}
                setFeedbackAdded={setFeedbackAdded}
              />
            </div>
          )}
      </div>
    );
  }

  return (
    <WidgetTemplate
      widgetName="Rubric"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      loading={isLoading}
      scrollable={scrollable}
    >
      {widgetContent}
    </WidgetTemplate>
  );
};

export default StudentRubricWidget;
