// Top-level prototype screens: the checkpoint map with its side card, the
// step player for one checkpoint, and the project workspace.

import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useMemo, useState} from 'react';

import {useExtraLinksButtonContext} from '@cdo/apps/lab2/views/LabViewsRenderer';

import CheckpointCard from './CheckpointCard';
import MapView from './MapView';
import {capabilityState, statusMap, useProgress} from './progress';
import ProjectCard from './ProjectCard';
import ProjectView from './ProjectView';
import StepPlayer from './StepPlayer';
import {Pathway} from './types';

import moduleStyles from './pathway.module.scss';

type View =
  | {kind: 'map'; focusId?: string}
  | {kind: 'step'; checkpointId: string}
  | {kind: 'project'};

const THEME_ITEMS = [
  {value: 'Light', text: 'Light'},
  {value: 'Dark', text: 'Dark'},
];

interface PathwayAppProps {
  pathway: Pathway;
}

const PathwayApp: React.FunctionComponent<PathwayAppProps> = ({pathway}) => {
  const {progress, markStarted, markComplete, editProject, reset} = useProgress(
    pathway.id
  );
  const {theme, setTheme} = useTheme();
  const {setShowExtraLinksButton} = useExtraLinksButtonContext();

  // The map and player own the whole viewport; the floating Extra Links
  // button would cover their bottom-left controls.
  useEffect(() => {
    setShowExtraLinksButton(false);
    return () => setShowExtraLinksButton(true);
  }, [setShowExtraLinksButton]);

  // Free-response questions with `saveAs` read and write project metadata.
  const projectAnswers = (step: {
    questions: {id: string; type: string; saveAs?: string}[];
  }) =>
    Object.fromEntries(
      step.questions.flatMap(q =>
        q.saveAs === 'projectTitle'
          ? [[q.id, progress.project.title]]
          : q.saveAs === 'projectDescription'
          ? [[q.id, progress.project.description]]
          : []
      )
    );
  const saveProjectAnswers = (
    step: {questions: {id: string; type: string; saveAs?: string}[]},
    answers: {[id: string]: string},
    completedCheckpointIds: string[]
  ) => {
    completedCheckpointIds.forEach(markComplete);
    for (const q of step.questions) {
      const value = answers[q.id]?.trim();
      if (!value) continue;
      if (q.saveAs === 'projectTitle') editProject({title: value});
      if (q.saveAs === 'projectDescription') editProject({description: value});
    }
  };
  const statuses = useMemo(
    () => statusMap(pathway, progress),
    [pathway, progress]
  );
  const checkpointById = (id: string) =>
    pathway.checkpoints.find(c => c.id === id);

  // Until something is complete, the page opens straight into the first
  // root checkpoint; afterwards it opens on the map.
  const [view, setView] = useState<View>(() => {
    const root = pathway.checkpoints.find(c => !c.requires?.length);
    return progress.completed.length === 0 && root
      ? {kind: 'step', checkpointId: root.id}
      : {kind: 'map'};
  });
  useEffect(() => {
    if (view.kind === 'step') markStarted(view.checkpointId);
    // Only the initial view matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (view.kind === 'step') {
    const checkpoint = checkpointById(view.checkpointId);
    if (checkpoint) {
      return (
        <div className={moduleStyles.app}>
          <StepPlayer
            checkpoint={checkpoint}
            capabilities={capabilityState(pathway, progress, checkpoint)}
            initialAnswers={projectAnswers}
            onAnswers={saveProjectAnswers}
            onExit={() => setView({kind: 'map', focusId: checkpoint.id})}
            onFinish={() => {
              markComplete(checkpoint.id);
              setView({kind: 'map'});
            }}
          />
        </div>
      );
    }
  }

  if (view.kind === 'project') {
    return (
      <div className={moduleStyles.app}>
        <ProjectView
          pathway={pathway}
          statuses={statuses}
          project={progress.project}
          capabilities={capabilityState(pathway, progress)}
          onExit={() => setView({kind: 'map'})}
          onSelectCheckpoint={id => setView({kind: 'map', focusId: id})}
        />
      </div>
    );
  }

  const focusId = view.kind === 'map' ? view.focusId : undefined;
  const focused = focusId ? checkpointById(focusId) : undefined;

  // A click on the map background while zoomed returns to the full map.
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (focusId && !(e.target as HTMLElement).closest('button')) {
      setView({kind: 'map'});
    }
  };

  return (
    <div className={moduleStyles.app}>
      <div className={moduleStyles.mapScreen}>
        <div className={moduleStyles.mapScroll} onClick={onMapClick}>
          {focusId && (
            <MuiButton
              variant="outlined"
              size="small"
              className={moduleStyles.mapBack}
              onClick={() => setView({kind: 'map'})}
            >
              <FontAwesomeV6Icon iconName="map" />
              &nbsp;Back to map
            </MuiButton>
          )}
          <header
            className={classNames(
              moduleStyles.mapHeader,
              focusId && moduleStyles.mapHeaderHidden
            )}
            aria-hidden={!!focusId}
          >
            <MuiTypography variant="overline1">Adaptive pathway</MuiTypography>
            <MuiTypography variant="h2">{pathway.title}</MuiTypography>
            <MuiTypography variant="body3" className={moduleStyles.muted}>
              {pathway.objective}
            </MuiTypography>
          </header>
          <MapView
            pathway={pathway}
            statuses={statuses}
            focusId={focusId}
            recommendedId={pathway.recommendedCheckpointId}
            onSelect={id =>
              setView({kind: 'map', focusId: id === focusId ? undefined : id})
            }
          />
        </div>
        <aside className={moduleStyles.side}>
          {focused ? (
            <CheckpointCard
              pathway={pathway}
              checkpoint={focused}
              status={statuses[focused.id]}
              onStart={() => {
                markStarted(focused.id);
                setView({kind: 'step', checkpointId: focused.id});
              }}
            />
          ) : (
            <ProjectCard
              pathway={pathway}
              statuses={statuses}
              project={progress.project}
              onEditProject={editProject}
              onOpenProject={() => setView({kind: 'project'})}
              onSelectCheckpoint={id => setView({kind: 'map', focusId: id})}
            />
          )}
          <div className={moduleStyles.sideFooter}>
            <SimpleDropdown
              name="adaptive-theme"
              labelText="Theme"
              isLabelVisible={false}
              items={THEME_ITEMS}
              selectedValue={theme}
              onChange={e => setTheme(e.target.value as Theme)}
              size="s"
            />
            <MuiButton
              variant="outlined"
              size="small"
              className={moduleStyles.resetButton}
              onClick={reset}
            >
              <FontAwesomeV6Icon iconName="rotate-right" />
              &nbsp;Reset progress
            </MuiButton>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PathwayApp;
