// Plays a referenced level by mounting its lab's Lab2 view over the level's
// own project. useSources resolves the level's channel, which the server
// shares among levels naming the same project template, so a sandbox level
// and a project level differ only in what levelbuilder says about them.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {Suspense, useEffect, useMemo, useState} from 'react';

import useSources from '@cdo/apps/lab2/hooks/useSources';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  Lab2EntryPoint,
  LevelProperties,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';

import {lab2EntryPoints} from '../../../../lab2EntryPoints';
import {buildTutorContext} from '../../ai/tutorContext';
import {LevelStep as LevelStepContent} from '../../types';
import {usePathwayContext} from '../PathwayContext';

import styles from './stepPlayer.module.scss';
import shared from '../shared.module.scss';

// Only a level with neither project nor start sources falls back to this,
// and then the lab seeds its own default instead.
const EMPTY_SOURCES: ProjectSources = {source: ''};

interface LevelStepProps {
  step: LevelStepContent;
  continueLabel: string;
  onComplete: () => void;
}

const LevelStep: React.FunctionComponent<LevelStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => {
  const {levelProperties} = step;
  const View =
    levelProperties && lab2EntryPoints[levelProperties.appName]?.view;

  if (!levelProperties || !View) {
    return (
      <div className={styles.stepFallback}>
        <MuiTypography variant="body3" className={shared.muted}>
          {levelProperties
            ? `No lab here can play '${levelProperties.appName}' levels.`
            : `Level '${step.level}' was not found.`}
        </MuiTypography>
        <MuiButton variant="contained" onClick={onComplete}>
          {continueLabel}
        </MuiButton>
      </div>
    );
  }

  return (
    <div className={styles.levelStep}>
      <LevelPlayer step={step} levelProperties={levelProperties} View={View} />
      <div className={styles.stepFooter}>
        <MuiButton variant="contained" size="small" onClick={onComplete}>
          {continueLabel}
        </MuiButton>
      </div>
    </div>
  );
};

interface LevelPlayerProps {
  step: LevelStepContent;
  levelProperties: LevelProperties;
  View: Lab2EntryPoint['view'];
}

/** Loads the level's project, then mounts the lab view over it. */
const LevelPlayer: React.FunctionComponent<LevelPlayerProps> = ({
  step,
  levelProperties,
  View,
}) => {
  const {currentSources, channel, projectManager, loadError} = useSources({
    levelProperties,
    defaultSources: EMPTY_SOURCES,
  });

  const {pathway, checkpoint, statusMap} = usePathwayContext();
  // Keyed on the project's strings, not the channel, which changes on every save.
  const projectName = step.project ? channel?.name : undefined;
  const projectDescription = step.project
    ? channel?.labConfig?.adaptive?.description
    : undefined;
  // Assemble the level properties to provide to the lab: the level's own, plus
  // adaptive-specific overrides: step-specific instructions, always hide share
  // and remix, and pathway-specific tutor context that gets appendd to the level
  // system prompt.
  const viewProperties = useMemo<LevelProperties>(() => {
    const context = buildTutorContext({
      pathway,
      checkpoint,
      step,
      statusMap,
      project: step.project
        ? {name: projectName, description: projectDescription}
        : undefined,
    });
    const own = levelProperties.levelSystemPrompt;
    return {
      ...levelProperties,
      hideShareAndRemix: true,
      longInstructions: step.instructions ?? levelProperties.longInstructions,
      levelSystemPrompt: own ? `${own}\n\n${context}` : context,
    };
  }, [
    pathway,
    checkpoint,
    statusMap,
    step,
    levelProperties,
    projectName,
    projectDescription,
  ]);

  // The lab saves through the registry, so the manager must be registered
  // before the lab mounts and reads it. The hook flushes saves on unmount.
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    if (!projectManager) return;
    Lab2Registry.getInstance().setProjectManager(projectManager);
    setRegistered(true);
    return () => {
      Lab2Registry.getInstance().clearProjectManager();
      setRegistered(false);
    };
  }, [projectManager]);

  if (loadError) {
    return (
      <div className={styles.stepFallback}>
        <MuiTypography variant="body3" className={shared.muted}>
          This level's project could not be loaded.
        </MuiTypography>
      </div>
    );
  }

  // A level with no sources at all falls back to our sentinel; the lab seeds
  // its own default in that case.
  const initialSources =
    currentSources === EMPTY_SOURCES ? undefined : currentSources;

  const ready = currentSources !== undefined && (!projectManager || registered);
  return (
    <div className={styles.levelHost}>
      {ready ? (
        <Suspense fallback={<Loading isLoading />}>
          <View
            levelProperties={viewProperties}
            initialSources={initialSources}
            channel={channel}
          />
        </Suspense>
      ) : (
        <Loading isLoading />
      )}
    </div>
  );
};

export default LevelStep;
