import {Typography} from '@mui/material';
import React from 'react';

import {Progress} from '@cdo/apps/adaptive/progress/model';
import {AiMetrics} from '@cdo/apps/adaptive/progress/progressStore';
import {usePathwayStatus} from '@cdo/apps/adaptive/progress/usePathwayStatus';
import {Pathway, StatsStep} from '@cdo/apps/adaptive/types';
import StatsList from '@cdo/apps/adaptive/views/StatsList';

import {useAdaptiveSnapshot} from '../useAdaptiveSnapshot';
import WidgetTemplate from '../widgetTemplate';

import styles from './adaptiveStatsWidget.module.scss';

interface AdaptiveStatsWidgetProps {
  selectedUnitId: number;
  selectedLessonId: number | null;
  selectedStudentId: number | null;
  hasAdaptiveLevel: boolean;
}

const Stats: React.FC<{
  pathway: Pathway;
  progress: Progress;
  aiMetrics?: AiMetrics;
}> = ({pathway, progress, aiMetrics}) => {
  const {statusMap} = usePathwayStatus(pathway, progress);
  // The figures the student's own wrap-up shows.
  const statsStep = pathway.checkpoints
    .flatMap(c => c.steps)
    .find((s): s is StatsStep => s.kind === 'stats');
  return (
    <StatsList
      pathway={pathway}
      statusMap={statusMap}
      aiMetrics={aiMetrics}
      stats={statsStep?.stats}
      narrow
    />
  );
};

const Message: React.FC<{text: string}> = ({text}) => (
  <div className={styles.message}>
    <Typography variant="body3">{text}</Typography>
  </div>
);

const AdaptiveStatsWidget: React.FC<AdaptiveStatsWidgetProps> = ({
  selectedUnitId,
  selectedLessonId,
  selectedStudentId,
  hasAdaptiveLevel,
}) => {
  const {fetched, loaded, pathway, progress} = useAdaptiveSnapshot(
    selectedUnitId,
    selectedLessonId,
    selectedStudentId,
    hasAdaptiveLevel
  );

  if (!hasAdaptiveLevel || !selectedStudentId || fetched.state === 'loading') {
    return null;
  }

  let content: React.ReactNode;
  if (pathway) {
    content = (
      <Stats
        pathway={pathway}
        progress={progress}
        aiMetrics={loaded?.aiMetrics}
      />
    );
  } else {
    content = <Message text="Stats unavailable." />;
  }

  return (
    <WidgetTemplate
      widgetName="Skill Map Stats"
      gridWidth={1}
      gridHeight={3}
      scrollable
    >
      {content}
    </WidgetTemplate>
  );
};

export default AdaptiveStatsWidget;
