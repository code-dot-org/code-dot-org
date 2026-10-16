import React, {useMemo} from 'react';

import {LabProps} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ProgressKey} from '../progress/progressStore';
import {AdaptiveContentError, parsePathway} from '../schema';
import {AdaptiveLevelProperties, Pathway} from '../types';

import PathwayApp from './PathwayApp';

import styles from './adaptiveView.module.scss';

type Parsed =
  | {pathway: Pathway; problems?: undefined}
  | {pathway?: undefined; problems: string[]};

/**
 * Parses and verifies adaptive content in level properties. Ensures
 * that an adaptive ID and pathway object both exist, their IDs match,
 * and that the pathway content parses correctly.
 */
function parseLevelContent(properties: AdaptiveLevelProperties): Parsed {
  const {adaptiveId, pathway} = properties;
  if (!adaptiveId) {
    return {problems: ['level has no adaptiveId']};
  }
  if (!pathway) {
    return {problems: [`no content was served for '${adaptiveId}'`]};
  }
  try {
    const parsed = parsePathway(pathway);
    if (parsed.id !== adaptiveId) {
      return {
        problems: [
          `content id '${parsed.id}' does not match the level's adaptiveId '${adaptiveId}'`,
        ],
      };
    }
    return {pathway: parsed};
  } catch (e) {
    if (e instanceof AdaptiveContentError) {
      return {problems: e.problems};
    }
    throw e;
  }
}

const AdaptiveView: React.FunctionComponent<
  LabProps<AdaptiveLevelProperties>
> = ({levelProperties}) => {
  const userId = useAppSelector(state => state.currentUser.userId);
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const parsed = useMemo(
    () => parseLevelContent(levelProperties),
    [levelProperties]
  );
  // Progress is kept per unit, so the level plays only from one.
  const progressKey = useMemo<ProgressKey | undefined>(
    () => (scriptId ? {scriptId, levelId: levelProperties.id} : undefined),
    [scriptId, levelProperties.id]
  );
  const problems =
    parsed.problems ??
    (progressKey ? [] : ['this level can only be played from a unit']);

  if (!parsed.pathway || !progressKey) {
    return (
      <div className={styles.container}>
        <h1>Adaptive: {levelProperties.adaptiveId ?? levelProperties.name}</h1>
        <h2>Content problems</h2>
        <ul>
          {problems.map(problem => (
            <li key={problem}>
              <code>{problem}</code>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <PathwayApp
      pathway={parsed.pathway}
      progressKey={progressKey}
      userId={userId ?? null}
    />
  );
};

export default AdaptiveView;
