import type {InferProps} from 'prop-types';
import React, {useEffect, useState} from 'react';

import LearningGoals from '@cdo/apps/templates/rubrics/LearningGoals';
import {aiEvaluationShape} from '@cdo/apps/templates/rubrics/rubricShapes';
import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';
import type {
  Rubric,
  RubricData,
  StudentLevelInfo,
  ReportingData,
} from '@cdo/apps/types/rubricTypes';
import HttpClient from '@cdo/apps/util/HttpClient';

type AiEvaluation = InferProps<typeof aiEvaluationShape>['isRequired'];

interface StudentRubricWidgetProps {
  gridWidth?: number;
  gridHeight?: number;
  rubricId: number;
  studentId: number;
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
  rubricId,
  studentId,
  studentLevelInfo,
  teacherHasEnabledAi = false,
  canProvideFeedback = true,
  reportingData,
  aiEvaluations,
}) => {
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [internalStudentLevelInfo, setInternalStudentLevelInfo] =
    useState<StudentLevelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackAdded, setFeedbackAdded] = useState(false);

  // Use provided studentLevelInfo or create a placeholder
  const effectiveStudentLevelInfo =
    studentLevelInfo ||
    internalStudentLevelInfo ||
    ({
      name: 'Student',
      user_id: studentId,
      timeSpent: 0,
      attempts: 0,
      lastAttempt: new Date().toISOString(),
    } as StudentLevelInfo);

  useEffect(() => {
    if (!rubricId) {
      setError('No rubric ID provided');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rubricResponse = await HttpClient.fetchJson<RubricData>(
          `/rubrics/${rubricId}`
        );

        if (rubricResponse.value?.rubric) {
          setRubric(rubricResponse.value.rubric);
        } else {
          setError('No rubric data found');
        }

        // TODO: Fetch actual student level info from backend if not provided
        // For now, create placeholder if not provided
        if (!studentLevelInfo) {
          setInternalStudentLevelInfo({
            name: 'Student',
            user_id: studentId,
            timeSpent: 0,
            attempts: 0,
            lastAttempt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Failed to fetch rubric data:', err);
        setError('Failed to load rubric data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [rubricId, studentId, studentLevelInfo]);

  // Loading state
  if (isLoading) {
    return (
      <WidgetTemplate
        widgetName="Rubric"
        gridWidth={gridWidth}
        gridHeight={gridHeight}
        loading={true}
      >
        <div>Loading rubric...</div>
      </WidgetTemplate>
    );
  }

  // Error state
  if (error) {
    return (
      <WidgetTemplate
        widgetName="Rubric"
        gridWidth={gridWidth}
        gridHeight={gridHeight}
      >
        <div style={{padding: '16px', color: '#d32f2f'}}>{error}</div>
      </WidgetTemplate>
    );
  }

  // No rubric data
  if (!rubric || !rubric.learningGoals) {
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
        studentLevelInfo={effectiveStudentLevelInfo}
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
