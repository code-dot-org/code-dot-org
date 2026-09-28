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
 * The served pathway, or the reasons it cannot play. The level names its
 * content by `adaptiveId`, the server reads the file of that name, and the
 * file's own `id` must match; a mismatch means the content was moved or
 * renamed underneath the level.
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
  const pathwayId = parsed.pathway?.id;

  // The UserLevel triple plus the content id, so a server store can take
  // over record for record.
  const progressKey = useMemo<ProgressKey | undefined>(
    () =>
      pathwayId === undefined
        ? undefined
        : {
            userId: userId ?? null,
            scriptId: scriptId ?? null,
            levelId: levelProperties.id,
            pathwayId,
          },
    [userId, scriptId, levelProperties.id, pathwayId]
  );

  if (!parsed.pathway || !progressKey) {
    return (
      <div className={styles.container}>
        <h1>Adaptive: {levelProperties.adaptiveId ?? levelProperties.name}</h1>
        <h2>Content problems</h2>
        <ul>
          {parsed.problems?.map(problem => (
            <li key={problem}>
              <code>{problem}</code>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <PathwayApp pathway={parsed.pathway} progressKey={progressKey} />;
};

export default AdaptiveView;
