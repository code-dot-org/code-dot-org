// Plays a referenced level by mounting its lab's Lab2 view over the level's
// own project. useSources resolves the level's channel, which the server
// shares among levels naming the same project template, so a sandbox level
// and a project level differ only in what levelbuilder says about them.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {Suspense, useEffect, useMemo, useState} from 'react';

import useSources from '@cdo/apps/lab2/hooks/useSources';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {resetProjectMetadata} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {
  Lab2EntryPoint,
  LevelProperties,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import {ExternalNavigationContext} from '@cdo/apps/lab2/views/components/Instructions/ExternalNavigationContext';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../../lab2EntryPoints';
import {buildTutorContext} from '../../ai/tutorContext';
import {projectInfoFromChannel} from '../../project/projectInfo';
import {LevelStep as LevelStepContent} from '../../types';
import {usePathwayContext} from '../PathwayContext';

import {useStepInstructions} from './useStepInstructions';

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

/** A level step whose level the server resolved. */
type PlayableLevelStep = LevelStepContent & {levelProperties: LevelProperties};

const isPlayable = (step: LevelStepContent): step is PlayableLevelStep =>
  step.levelProperties !== undefined;

const LevelStep: React.FunctionComponent<LevelStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => {
  const View =
    step.levelProperties && lab2EntryPoints[step.levelProperties.appName]?.view;

  if (!isPlayable(step) || !View) {
    return (
      <div className={styles.stepFallback}>
        <MuiTypography variant="body3" className={shared.muted}>
          {step.levelProperties
            ? `No lab here can play '${step.levelProperties.appName}' levels.`
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
      <LevelPlayer
        step={step}
        View={View}
        continueLabel={continueLabel}
        onComplete={onComplete}
      />
    </div>
  );
};

type LevelPlayerProps = LevelStepProps & {
  step: PlayableLevelStep;
  View: Lab2EntryPoint['view'];
};

/** Loads the level's project, then mounts the lab view over it. */
const LevelPlayer: React.FunctionComponent<LevelPlayerProps> = ({
  step,
  View,
  continueLabel,
  onComplete,
}) => {
  const {levelProperties} = step;
  const {currentSources, channel, projectManager, loadError} = useSources({
    levelProperties,
    defaultSources: EMPTY_SOURCES,
  });

  const {
    pathway,
    checkpoint,
    statusMap,
    progress,
    saveGeneratedInstructions,
    aiContext,
  } = usePathwayContext();
  // Keyed on the project's strings, not the channel, which changes on every save.
  const {name: projectName, description: projectDescription} =
    projectInfoFromChannel(step.project ? channel : undefined);
  // Instructions: the step's own or the level's, or for a project step with
  // a prompt, generated around the student's project. The lab waits until
  // they are resolved, so it never mounts with text that is about to change.
  const {instructions, isResolved} = useStepInstructions({
    pathway,
    checkpoint,
    step,
    projectInfo: {name: projectName, description: projectDescription},
    sources: currentSources,
    authoredInstructions: step.instructions ?? levelProperties.longInstructions,
    generatedInstructions: progress.steps[step.id]?.generatedInstructions,
    saveGeneratedInstructions,
    aichatContext: aiContext,
  });
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
      // Default to pinning, but let the level override if needed.
      showInstructionsInAiTutor: true,
      ...levelProperties,
      hideShareAndRemix: true,
      longInstructions: instructions,
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
    instructions,
  ]);

  // The lab's own Continue button advances the step.
  const navigation = useMemo(
    () => ({
      label: continueLabel,
      enabled: true,
      endIcon: <FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />,
      onContinue: onComplete,
    }),
    [continueLabel, onComplete]
  );

  // Stands in for ProjectContainer's level-change reset, which steps bypass.
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(resetProjectMetadata());
  }, [dispatch]);

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

  const ready =
    currentSources !== undefined &&
    (!projectManager || registered) &&
    isResolved;
  // Resolving instructions can take a model call; say so instead of "slow".
  const loadingText =
    currentSources !== undefined && !isResolved
      ? 'Preparing your workspace...'
      : undefined;
  return (
    <div className={styles.levelHost}>
      {ready ? (
        <ExternalNavigationContext.Provider value={navigation}>
          <Suspense fallback={<Loading isLoading />}>
            <View
              levelProperties={viewProperties}
              initialSources={initialSources}
              channel={channel}
            />
          </Suspense>
        </ExternalNavigationContext.Provider>
      ) : (
        <Loading isLoading loadingText={loadingText} />
      )}
    </div>
  );
};

export default LevelStep;
