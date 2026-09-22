import React, {useMemo} from 'react';

import {LabProps} from '@cdo/apps/lab2/types';

import PathwayApp from './PathwayApp';
import {AdaptiveContentError, parsePathway} from './schema';
import {AdaptiveLevelProperties} from './types';

import moduleStyles from './adaptiveView.module.scss';

const AdaptiveView: React.FunctionComponent<
  LabProps<AdaptiveLevelProperties>
> = ({levelProperties}) => {
  const {adaptiveId, pathway} = levelProperties;

  const parsed = useMemo(() => {
    try {
      return {pathway: parsePathway(pathway), problems: [] as string[]};
    } catch (e) {
      if (e instanceof AdaptiveContentError) {
        return {pathway: undefined, problems: e.problems};
      }
      throw e;
    }
  }, [pathway]);

  if (!parsed.pathway) {
    return (
      <div className={moduleStyles.container}>
        <h1>Adaptive: {adaptiveId}</h1>
        <h2>Content problems</h2>
        <ul>
          {parsed.problems.map(problem => (
            <li key={problem}>
              <code>{problem}</code>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <PathwayApp pathway={parsed.pathway} />;
};

export default AdaptiveView;
