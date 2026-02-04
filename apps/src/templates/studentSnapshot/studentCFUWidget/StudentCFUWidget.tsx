import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState} from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';
import HttpClient from '@cdo/apps/util/HttpClient';

import StudentCFUWidgetQuestionsSection from './questionsSection/StudentCFUWidgetQuestionsSection';
import StudentCFUWidgetHeader from './StudentCFUWidgetHeader';
import {CFULevel, CFULevelResponse, StatusBucket} from './types';

import styles from './studentCFUWidget.module.scss';

interface CFULevelsData {
  cfu_levels: CFULevel[];
}

interface CFULevelResponsesData {
  cfu_responses: CFULevelResponse[];
}

interface StudentCFUWidgetProps {
  gridWidth?: number;
  gridHeight?: number;
  // When provided, the widget uses these values directly and does not fetch.
  cfuLevels?: CFULevel[];
  cfuResponses?: CFULevelResponse[];
  // Optional loading override (used by Storybook/tests). In normal usage,
  // the widget computes its own loading state from fetches.
  isLoading?: boolean;
  // When cfuLevels/cfuResponses are not provided, the widget will fetch CFU
  // data using these identifiers.
  lessonId?: number | null;
  studentId?: number | null;
}

/**
 * Temporary CFU widget that simply renders the raw CFU level data.
 *
 * Once designs are finalized, this widget can be updated to render
 * the appropriate UI for Match / Multi / Free Response CFU types.
 */
const StudentCFUWidget: React.FC<StudentCFUWidgetProps> = ({
  gridWidth = 2,
  gridHeight = 2,
  isLoading,
  lessonId,
  studentId,
}) => {
  const [fetchedCfuLevels, setFetchedCfuLevels] = useState<CFULevel[]>([]);
  const [fetchedCfuResponses, setFetchedCfuResponses] = useState<
    CFULevelResponse[]
  >([]);
  const [isCfuLevelsLoading, setIsCfuLevelsLoading] = useState<boolean>(false);
  const [isCfuResponsesLoading, setIsCfuResponsesLoading] =
    useState<boolean>(false);

  // Fetch CFU levels when lessonId changes, unless parent supplies cfuLevels.
  useEffect(() => {
    if (!lessonId) {
      setFetchedCfuLevels([]);
      setIsCfuLevelsLoading(false);
      return;
    }

    setIsCfuLevelsLoading(true);
    HttpClient.fetchJson<CFULevelsData>(
      `/student_snapshots/cfu_levels/${lessonId}`
    )
      .then(response => {
        setFetchedCfuLevels(response?.value?.cfu_levels || []);
      })
      .catch(error => {
        console.error('Error fetching CFU levels:', error);
        setFetchedCfuLevels([]);
      })
      .finally(() => {
        setIsCfuLevelsLoading(false);
      });
  }, [lessonId]);

  // Fetch CFU responses when lessonId or studentId changes, unless parent
  // supplies cfuResponses.
  useEffect(() => {
    if (!lessonId || !studentId) {
      setFetchedCfuResponses([]);
      setIsCfuResponsesLoading(false);
      return;
    }

    setIsCfuResponsesLoading(true);
    HttpClient.fetchJson<CFULevelResponsesData>(
      `/student_snapshots/cfu_responses/${lessonId}?student_id=${studentId}`
    )
      .then(response => {
        setFetchedCfuResponses(response?.value?.cfu_responses || []);
      })
      .catch(error => {
        console.error('Error fetching CFU responses:', error);
        setFetchedCfuResponses([]);
      })
      .finally(() => {
        setIsCfuResponsesLoading(false);
      });
  }, [lessonId, studentId]);

  const loading =
    isLoading || isCfuLevelsLoading || isCfuResponsesLoading || false;

  const responsesByLevelId = React.useMemo(() => {
    const map = new Map<number, CFULevelResponse>();
    fetchedCfuResponses.forEach(r => map.set(r.level_id, r));
    return map;
  }, [fetchedCfuResponses]);

  const bucketForLevel = React.useCallback(
    (levelId: number): StatusBucket => {
      const response = responsesByLevelId.get(levelId)?.response;
      if (!response) {
        return 'incomplete';
      }

      // LevelGroup: compute a coarse status from its sublevel statuses.
      if (
        response.type === 'LevelGroup' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Array.isArray((response as any).level_results)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const levelResults = (response as any).level_results as any[];
        const buckets = levelResults.map(lr => {
          const status = lr?.status;
          if (status === 'correct') return 'correct';
          if (status === 'incorrect') return 'incorrect';
          if (status === 'unsubmitted') return 'incomplete';
          if (Array.isArray(status))
            return status.includes('unsubmitted')
              ? 'incomplete'
              : 'partially_correct';
          // Free response uses empty string status; treat as completed.
          return lr?.student_result ? 'partially_correct' : 'incomplete';
        });
        if (buckets.length === 0) return 'incomplete';
        if (buckets.every(b => b === 'correct')) return 'correct';
        if (buckets.some(b => b === 'incorrect')) return 'incorrect';
        if (buckets.some(b => b === 'incomplete')) return 'incomplete';
        return 'partially_correct';
      }

      // Match: backend sends correct/incorrect only; derive partially_correct from student_result.
      // Option at index i is correct when student_result[i] === i (same as CFUMatchAnswer).
      if (response.type === 'Match') {
        const studentResult = (response as {student_result?: number[]})
          .student_result;
        if (!Array.isArray(studentResult) || studentResult.length === 0) {
          return 'incomplete';
        }
        const total = studentResult.length;
        const correctCount = studentResult.filter(
          (answer: number, index: number) => answer === index
        ).length;
        if (correctCount === total) return 'correct';
        if (correctCount > 0) return 'partially_correct';
        return 'incorrect';
      }

      // Multi: status is correct/incorrect/unsubmitted
      // Free response: status is "" and student_result contains the text
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (response as any).status;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentResult = (response as any).student_result;

      if (status === 'correct') return 'correct';
      if (status === 'incorrect') return 'incorrect';
      if (status === 'unsubmitted') return 'incomplete';
      if (Array.isArray(status)) {
        if (status.includes('unsubmitted')) return 'incomplete';
        if (
          Array.isArray(studentResult) &&
          studentResult.length === status.length &&
          studentResult.every(
            (answer: number, index: number) => answer === index
          )
        ) {
          return 'correct';
        }
        // All submitted but not all correct = partially_correct
        return 'partially_correct';
      }
      if (studentResult !== undefined && studentResult !== null)
        return 'partially_correct';
      return 'incomplete';
    },
    [responsesByLevelId]
  );

  const statusBuckets = React.useMemo(
    () => fetchedCfuLevels.map(level => bucketForLevel(level.id)),
    [fetchedCfuLevels, bucketForLevel]
  );

  const summary = React.useMemo(() => {
    const total = fetchedCfuLevels.length;
    const counts = statusBuckets.reduce(
      (acc, b) => {
        acc[b] += 1;
        return acc;
      },
      {
        correct: 0,
        partially_correct: 0,
        incorrect: 0,
        incomplete: 0,
      } as Record<StatusBucket, number>
    );
    const completed = total - counts.incomplete;
    const accuracy =
      completed === 0 ? 0 : Math.round((counts.correct / completed) * 100);
    return {total, completed, accuracy, counts};
  }, [fetchedCfuLevels, statusBuckets]);

  let content: React.ReactNode;
  let scrollable = false;

  if (loading) {
    content = <BodyThreeText>Loading CFU data...</BodyThreeText>;
  } else if (!fetchedCfuLevels || fetchedCfuLevels.length === 0) {
    content = (
      <BodyThreeText>
        This lesson doesn't have any "Check for Understanding" questions.
      </BodyThreeText>
    );
  } else {
    scrollable = true;
    content = (
      <div className={styles.studentCFUWidgetContent}>
        <StudentCFUWidgetHeader
          completed={summary.completed}
          total={summary.total}
          accuracy={summary.accuracy}
          counts={summary.counts}
        />
        {!!fetchedCfuLevels.length && (
          <StudentCFUWidgetQuestionsSection
            cfuLevels={fetchedCfuLevels}
            cfuResponses={fetchedCfuResponses}
            statusBuckets={statusBuckets}
          />
        )}
      </div>
    );
  }

  return (
    <WidgetTemplate
      widgetName="Check for Understanding Summary"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      loading={loading}
      scrollable={scrollable}
    >
      {content}
    </WidgetTemplate>
  );
};

export default StudentCFUWidget;
