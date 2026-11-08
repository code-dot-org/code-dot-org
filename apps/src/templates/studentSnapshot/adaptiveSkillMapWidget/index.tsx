import {Typography} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';

import {EMPTY_PROGRESS, Progress} from '@cdo/apps/adaptive/progress/model';
import {usePathwayStatus} from '@cdo/apps/adaptive/progress/usePathwayStatus';
import {parsePathway} from '@cdo/apps/adaptive/schema';
import {Pathway} from '@cdo/apps/adaptive/types';
import {resolveMapSettings} from '@cdo/apps/adaptive/views/map/mapSettings';
import MapView from '@cdo/apps/adaptive/views/map/MapView';
import MapZoom from '@cdo/apps/adaptive/views/map/MapZoom';
import HttpClient from '@cdo/apps/util/HttpClient';

import WidgetTemplate from '../widgetTemplate';

import styles from './adaptiveSkillMapWidget.module.scss';

interface AdaptiveSkillMapWidgetProps {
  selectedUnitId: number;
  selectedLessonId: number | null;
  selectedStudentId: number | null;
  hasAdaptiveLevel: boolean;
}

interface AdaptiveSnapshotData {
  pathway: unknown;
  progress: Partial<Progress> | null;
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

// Percentages of the size at which the map fills the widget's width. Below
// 100 the map is narrower than the widget and centered in it.
const ZOOM_PERCENTAGES = [25, 50, 75, 100, 150, 200];
const START_ZOOM = ZOOM_PERCENTAGES.indexOf(75);

const parseOrUndefined = (raw: unknown): Pathway | undefined => {
  if (!raw) return undefined;
  try {
    return parsePathway(raw);
  } catch (error) {
    console.error('Adaptive skill map: content does not parse', error);
    return undefined;
  }
};

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
