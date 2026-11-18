import React, {useEffect, useMemo, useState} from 'react';

import {LabProps} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {countAdaptive, reportAdaptiveError} from '../observability';
import {ProgressKey} from '../progress/progressStore';
import {AdaptiveContentError, parsePathway} from '../schema';
import {AdaptiveLevelProperties, Pathway} from '../types';

import AccessBlockedScreen from './access/AccessBlockedScreen';
import {adaptiveAccess} from './access/adaptiveAccess';
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
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const access = useAppSelector(state =>
    adaptiveAccess({
      aiChatAccessLevel: state.currentUser.aiChatAccessLevel,
      userType: state.currentUser.userType,
      inSection: state.currentUser.inSection,
    })
  );
  const [teacherContinued, setTeacherContinued] = useState(false);
  useEffect(() => {
    if (access === 'pending' || access === 'allowed') return;
    countAdaptive('Adaptive.AccessBlocked', {reason: access});
  }, [access]);
  const parsed = useMemo(
    () => parseLevelContent(levelProperties),
    [levelProperties]
  );
  // Progress is kept per unit, so the level plays only from one.
  const progressKey = useMemo<ProgressKey | undefined>(
    () => (scriptId ? {scriptId, levelId: levelProperties.id} : undefined),
    [scriptId, levelProperties.id]
  );
  // Students see this page too, so a bad pathway edit is an outage, not a preview.
  useEffect(() => {
    countAdaptive('Adaptive.PathwayLoad', {
      Outcome: parsed.problems ? 'content_problems' : 'ok',
    });
    if (!parsed.problems) return;
    reportAdaptiveError(
      'Adaptive pathway content has problems',
      new Error(parsed.problems.join('; ')),
      {
        problems: parsed.problems,
        pathwayId: levelProperties.adaptiveId,
        levelId: levelProperties.id,
      }
    );
  }, [parsed, levelProperties.adaptiveId, levelProperties.id]);
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

  if (access === 'pending') return null;
  if (
    access !== 'allowed' &&
    !(access === 'unverifiedTeacher' && teacherContinued)
  ) {
    return (
      <AccessBlockedScreen
        reason={access}
        onContinue={() => setTeacherContinued(true)}
      />
    );
  }

  return (
    <PathwayApp
      pathway={parsed.pathway}
      progressKey={progressKey}
      levelProperties={levelProperties}
    />
  );
};

export default AdaptiveView;
