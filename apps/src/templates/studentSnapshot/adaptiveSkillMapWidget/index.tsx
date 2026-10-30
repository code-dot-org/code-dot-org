import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';

import {EMPTY_PROGRESS, Progress} from '@cdo/apps/adaptive/progress/model';
import {usePathwayStatus} from '@cdo/apps/adaptive/progress/usePathwayStatus';
import {parsePathway} from '@cdo/apps/adaptive/schema';
import {Pathway} from '@cdo/apps/adaptive/types';
import {resolveMapSettings} from '@cdo/apps/adaptive/views/map/mapSettings';
import MapView from '@cdo/apps/adaptive/views/map/MapView';
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

const noop = () => {};

// Multiples of the scale at which the map fills the widget's width. Below 1
// the map is narrower than the widget and centered in it.
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2];
const START_ZOOM = ZOOM_LEVELS.indexOf(0.75);

const parseOrUndefined = (raw: unknown): Pathway | undefined => {
  if (!raw) return undefined;
  try {
    return parsePathway(raw);
  } catch (error) {
    console.error('Adaptive skill map: content does not parse', error);
    return undefined;
  }
};

const ZoomControls: React.FC<{
  level: number;
  setLevel: (level: number) => void;
}> = ({level, setLevel}) => (
  <div className={styles.zoomControls}>
    <IconButton
      size="small"
      aria-label="Zoom in"
      disabled={level === ZOOM_LEVELS.length - 1}
      onClick={() => setLevel(level + 1)}
    >
      <FontAwesomeV6Icon iconName="magnifying-glass-plus" />
    </IconButton>
    <IconButton
      size="small"
      aria-label="Zoom out"
      disabled={level === 0}
      onClick={() => setLevel(level - 1)}
    >
      <FontAwesomeV6Icon iconName="magnifying-glass-minus" />
    </IconButton>
    <IconButton
      size="small"
      aria-label="Reset zoom"
      disabled={level === START_ZOOM}
      onClick={() => setLevel(START_ZOOM)}
    >
      <FontAwesomeV6Icon iconName="expand" />
    </IconButton>
  </div>
);

const SkillMap: React.FC<{
  pathway: Pathway;
  progress: Progress;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
}> = ({pathway, progress, zoomLevel, setZoomLevel}) => {
  const {statusMap} = usePathwayStatus(pathway, progress);
  // The snapshot page's own query string must not pick the layout.
  const settings = useMemo(() => resolveMapSettings(pathway, ''), [pathway]);
  // The root, which a student starts from.
  const startId = pathway.checkpoints.find(c => !c.requires?.length)?.id;
  return (
    <div className={styles.map}>
      <ZoomControls level={zoomLevel} setLevel={setZoomLevel} />
      <MapView
        pathway={pathway}
        statusMap={statusMap}
        settings={settings}
        zoom={ZOOM_LEVELS[zoomLevel]}
        startId={startId}
        onSelect={noop}
      />
    </div>
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
  const [zoomLevel, setZoomLevel] = useState(START_ZOOM);

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

  if (!hasAdaptiveLevel) {
    return null;
  }

  const hasStudent = !!selectedStudentId;
  let content: React.ReactNode;
  if (!hasStudent) {
    content = <Message text="Select a student to see their skill map." />;
  } else if (pathway) {
    content = (
      <SkillMap
        pathway={pathway}
        progress={progress}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />
    );
  } else {
    content = <Message text="Skill map unavailable." />;
  }

  return (
    <WidgetTemplate
      widgetName="Skill Map"
      gridWidth={2}
      gridHeight={2}
      loading={hasStudent && fetched.state === 'loading'}
    >
      {content}
    </WidgetTemplate>
  );
};

export default AdaptiveSkillMapWidget;
