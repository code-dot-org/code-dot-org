import {Typography} from '@mui/material';
import React, {useMemo} from 'react';

import {Progress} from '@cdo/apps/adaptive/progress/model';
import {usePathwayStatus} from '@cdo/apps/adaptive/progress/usePathwayStatus';
import {Pathway} from '@cdo/apps/adaptive/types';
import {resolveMapSettings} from '@cdo/apps/adaptive/views/map/mapSettings';
import MapView from '@cdo/apps/adaptive/views/map/MapView';
import MapZoom from '@cdo/apps/adaptive/views/map/MapZoom';

import {useAdaptiveSnapshot} from '../useAdaptiveSnapshot';
import WidgetTemplate from '../widgetTemplate';

import styles from './adaptiveSkillMapWidget.module.scss';

interface AdaptiveSkillMapWidgetProps {
  selectedUnitId: number;
  selectedLessonId: number | null;
  selectedStudentId: number | null;
  hasAdaptiveLevel: boolean;
}

// Percentages of the size at which the map fills the widget's width. Below
// 100 the map is narrower than the widget and centered in it.
const ZOOM_PERCENTAGES = [25, 50, 75, 100, 150, 200];
const START_ZOOM = ZOOM_PERCENTAGES.indexOf(75);

const SkillMap: React.FC<{
  pathway: Pathway;
  progress: Progress;
}> = ({pathway, progress}) => {
  const {statusMap} = usePathwayStatus(pathway, progress);
  // The snapshot page's own query string must not pick the layout.
  const settings = useMemo(() => resolveMapSettings(pathway, ''), [pathway]);
  // The root, which a student starts from.
  const startId = pathway.checkpoints.find(c => !c.requires?.length)?.id;
  return (
    <MapZoom
      zoomPercentages={ZOOM_PERCENTAGES}
      startLevel={START_ZOOM}
      fit="width"
      startId={startId}
      className={styles.map}
      controlsClassName={styles.zoomControls}
    >
      <MapView
        pathway={pathway}
        statusMap={statusMap}
        settings={settings}
        fit="width"
      />
    </MapZoom>
  );
};

const Message: React.FC<{text: string}> = ({text}) => (
  <div className={styles.message}>
    <Typography variant="body3">{text}</Typography>
  </div>
);

const AdaptiveSkillMapWidget: React.FC<AdaptiveSkillMapWidgetProps> = ({
  selectedUnitId,
  selectedLessonId,
  selectedStudentId,
  hasAdaptiveLevel,
}) => {
  const {fetched, pathway, progress} = useAdaptiveSnapshot(
    selectedUnitId,
    selectedLessonId,
    selectedStudentId,
    hasAdaptiveLevel
  );

  const hasStudent = !!selectedStudentId;
  if (!hasAdaptiveLevel || (hasStudent && fetched.state === 'loading')) {
    return null;
  }

  let content: React.ReactNode;
  if (!hasStudent) {
    content = <Message text="Select a student to see their skill map." />;
  } else if (pathway) {
    content = <SkillMap pathway={pathway} progress={progress} />;
  } else {
    content = <Message text="Skill map unavailable." />;
  }

  return (
    <WidgetTemplate widgetName="Skill Map" gridWidth={2} gridHeight={3}>
      {content}
    </WidgetTemplate>
  );
};

export default AdaptiveSkillMapWidget;
