import React, {useEffect, useState} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import HttpClient from '@cdo/apps/util/HttpClient';

import CodeWidget from './';

interface ExemplarCodeWidgetProps {
  gridWidth?: number;
  gridHeight?: number;
  lessonId?: number | null;
}

interface ExemplarCodeData {
  id: number;
  name: string;
  exemplarSources?: MultiFileSource;
}

const getExemplarCodeData = (lessonId: number) => {
  return HttpClient.fetchJson<ExemplarCodeData>(
    `/student_snapshots/exemplar_code/${lessonId}`
  ).then(response => response?.value);
};

const ExemplarCodeWidget = ({
  gridWidth = 1,
  gridHeight = 2,
  lessonId,
}: ExemplarCodeWidgetProps) => {
  const [exemplarCode, setExemplarCode] = useState<ExemplarCodeData>();
  const [isLoading, setIsLoading] = useState(true);

  const [lastLessonId, setLastLessonId] = useState(lessonId);
  if (lessonId !== lastLessonId) {
    setLastLessonId(lessonId);
    setExemplarCode(undefined);
    setIsLoading(!!lessonId);
  }

  useEffect(() => {
    if (lessonId) {
      let isCancelled = false;

      getExemplarCodeData(lessonId)
        .then(data => {
          if (!isCancelled) {
            setExemplarCode(data);
          }
        })
        .catch(error => {
          if (!isCancelled) {
            console.error('Error fetching exemplar code:', error);
            setExemplarCode(undefined);
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoading(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    }
  }, [lessonId]);

  if (!isLoading && !exemplarCode?.exemplarSources) {
    return null;
  }

  return (
    <CodeWidget
      codeData={exemplarCode?.exemplarSources}
      widgetName="Exemplar Code"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      loading={isLoading}
    />
  );
};

export default ExemplarCodeWidget;
