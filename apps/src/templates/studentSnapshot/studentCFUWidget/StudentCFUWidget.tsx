import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState} from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';
import HttpClient from '@cdo/apps/util/HttpClient';

interface CFULevel {
  id: number;
  name: string;
  display_name: string;
  type: string;
  key?: string;
  script_level_id: number;
  progression?: string;
  progression_display_name?: string;
  // Optional fields populated by the backend for question content.
  question_text?: string | null;
  answers?: unknown;
}

interface CFULevelResponse {
  level_id: number;
  script_level_id: number;
  response: {
    type: string;
    student_result?: unknown;
    status: unknown;
  };
  submitted?: boolean;
  timestamp?: string;
}

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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.error('Error fetching CFU responses:', error);
        setFetchedCfuResponses([]);
      })
      .finally(() => {
        setIsCfuResponsesLoading(false);
      });
  }, [lessonId, studentId]);

  const loading =
    isLoading || isCfuLevelsLoading || isCfuResponsesLoading || false;

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
    );
  }

  return (
    <WidgetTemplate
      widgetName="CFU (raw)"
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
