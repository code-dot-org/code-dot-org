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

      // Multi: status is correct/incorrect/unsubmitted
      // Match: status is array of submitted/unsubmitted, correctness determined by student_result
      // Free response: status is "" and student_result contains the text
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (response as any).status;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentResult = (response as any).student_result;

      if (status === 'correct') return 'correct';
      if (status === 'incorrect') return 'incorrect';
      if (status === 'unsubmitted') return 'incomplete';
      if (Array.isArray(status)) {
        // For Match levels: if any unsubmitted, it's incomplete
        if (status.includes('unsubmitted')) return 'incomplete';
        // If all submitted, check if all matches are correct
        // For Match, correct means student_result[index] === index for all
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
      <BodyThreeText>No CFU data available for this lesson.</BodyThreeText>
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
        <StudentCFUWidgetQuestionsSection
          cfuLevels={fetchedCfuLevels}
          cfuResponses={fetchedCfuResponses}
          statusBuckets={statusBuckets}
        />

        <div style={{marginBottom: 12}}>
          <ul style={{margin: '8px 0 0 18px', padding: 0}}>
            {fetchedCfuLevels.map(level => {
              const bucket = bucketForLevel(level.id);
              return (
                <li key={level.id} style={{marginBottom: 6}}>
                  <BodyThreeText>
                    {level.display_name} — {level.type} —{' '}
                    <strong>{bucket}</strong>
                  </BodyThreeText>
                </li>
              );
            })}
          </ul>
        </div>
        <BodyThreeText>
          <strong>Raw data</strong>
        </BodyThreeText>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'monospace',
            fontSize: 12,
            margin: 0,
          }}
        >
          {JSON.stringify(
            {
              levels: fetchedCfuLevels,
              responses: fetchedCfuResponses || [],
            },
            null,
            2
          )}
        </pre>
      </div>
    );
  }

  return (
    <WidgetTemplate
      widgetName="CFU"
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
