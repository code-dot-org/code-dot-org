import {useEffect, useMemo, useState} from 'react';

import {EMPTY_PROGRESS, Progress} from '@cdo/apps/adaptive/progress/model';
import {AiMetrics} from '@cdo/apps/adaptive/progress/progressStore';
import {parsePathway} from '@cdo/apps/adaptive/schema';
import {Pathway} from '@cdo/apps/adaptive/types';
import HttpClient from '@cdo/apps/util/HttpClient';

interface AdaptiveSnapshotData {
  pathway: unknown;
  progress: Partial<Progress> | null;
  aiMetrics?: AiMetrics;
}

type Fetched =
  | {state: 'loading'}
  | {state: 'failed'}
  | {state: 'loaded'; data: AdaptiveSnapshotData};

const getAdaptiveSnapshot = (
  unitId: number,
  lessonId: number,
  studentId: number
) =>
  HttpClient.fetchJson<AdaptiveSnapshotData>(
    `/student_snapshots/units/${unitId}/lessons/${lessonId}/students/${studentId}/adaptive`
  ).then(response => response.value);

const parseOrUndefined = (raw: unknown): Pathway | undefined => {
  if (!raw) return undefined;
  try {
    return parsePathway(raw);
  } catch (error) {
    console.error('Adaptive skill map: content does not parse', error);
    return undefined;
  }
};

export function useAdaptiveSnapshot(
  selectedUnitId: number,
  selectedLessonId: number | null,
  selectedStudentId: number | null,
  hasAdaptiveLevel: boolean
) {
  const [fetched, setFetched] = useState<Fetched>({state: 'loading'});

  useEffect(() => {
    if (
      !hasAdaptiveLevel ||
      !selectedUnitId ||
      !selectedLessonId ||
      !selectedStudentId
    ) {
      return;
    }
    let isCancelled = false;
    setFetched({state: 'loading'});
    getAdaptiveSnapshot(selectedUnitId, selectedLessonId, selectedStudentId)
      .then(data => {
        if (!isCancelled) setFetched({state: 'loaded', data});
      })
      .catch(error => {
        if (isCancelled) return;
        console.error('Error fetching adaptive skill map:', error);
        setFetched({state: 'failed'});
      });
    return () => {
      isCancelled = true;
    };
  }, [hasAdaptiveLevel, selectedUnitId, selectedLessonId, selectedStudentId]);

  const loaded = fetched.state === 'loaded' ? fetched.data : undefined;
  const pathway = useMemo(
    () => parseOrUndefined(loaded?.pathway),
    [loaded?.pathway]
  );
  const progress = useMemo(
    () => ({...EMPTY_PROGRESS, ...loaded?.progress}),
    [loaded?.progress]
  );

  return {fetched, loaded, pathway, progress};
}
