// Plays a referenced level by mounting its lab's Lab2 view over the level's
// own project. useSources resolves the level's channel, which the server
// shares among levels naming the same project template, so a sandbox level
// and a project level differ only in what levelbuilder says about them.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {Suspense, useEffect, useMemo, useState} from 'react';

import useSources from '@cdo/apps/lab2/hooks/useSources';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  AppName,
  Lab2EntryPoint,
  LevelProperties,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';

import {lab2EntryPoints} from '../../../../lab2EntryPoints';
import {LevelStep as LevelStepContent} from '../../types';

import styles from './stepPlayer.module.scss';
import shared from '../shared.module.scss';

// Indexed loosely: the server may name a lab this bundle does not register.
const entryPoints: {[app in AppName]?: Lab2EntryPoint} = lab2EntryPoints;

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
  const stepProperties = useMemo<LevelProperties | undefined>(
    () =>
      levelProperties && {
        ...levelProperties,
        hideShareAndRemix: true,
        longInstructions: step.instructions ?? levelProperties.longInstructions,
      },
    [levelProperties, step.instructions]
  );
  const View = stepProperties && entryPoints[stepProperties.appName]?.view;

  if (!stepProperties || !View) {
    return (
      <div className={styles.stepFallback}>
        <MuiTypography variant="body3" className={shared.muted}>
          {stepProperties
            ? `No lab here can play '${stepProperties.appName}' levels.`
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
      <LevelPlayer levelProperties={stepProperties} View={View} />
      <div className={styles.stepFooter}>
        <MuiButton variant="contained" size="small" onClick={onComplete}>
          {continueLabel}
        </MuiButton>
      </div>
    </div>
  );
};

interface LevelPlayerProps {
  levelProperties: LevelProperties;
  View: Lab2EntryPoint['view'];
}

/** Loads the level's project, then mounts the lab view over it. */
const LevelPlayer: React.FunctionComponent<LevelPlayerProps> = ({
  levelProperties,
  View,
}) => {
  const {currentSources, channel, projectManager, loadError} = useSources({
    levelProperties,
    defaultSources: EMPTY_SOURCES,
  });

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

  // With nothing saved yet, the hook hands back the level's own start or
  // template sources by reference, in the level's shape rather than the
  // project's. The lab seeds those itself, so only saved sources pass through.
  const savedSources =
    currentSources === EMPTY_SOURCES ||
    currentSources === levelProperties.startSources ||
    currentSources === levelProperties.templateSources
      ? undefined
      : currentSources;

  const ready = currentSources !== undefined && (!projectManager || registered);
  return (
    <div className={styles.levelHost}>
      {ready ? (
        <Suspense fallback={<Loading isLoading />}>
          <View
            levelProperties={levelProperties}
            initialSources={savedSources}
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
