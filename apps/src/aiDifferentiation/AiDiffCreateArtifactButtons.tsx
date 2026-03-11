import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import {setPendingArtifactMessage} from '@cdo/apps/aichat/redux/slice';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {EVENTS} from '../metrics/AnalyticsConstants';

import {ChatTextMessage} from './types';

import style from './ai-differentiation.module.scss';

interface Props {
  message: ChatTextMessage;
  threadId: number;
  eventCallback: (
    thread: number,
    event: (typeof EVENTS)[keyof typeof EVENTS],
    prompt?: string
  ) => void;
}

const AiDiffCreateArtifactButtons: React.FC<Props> = ({
  message,
  threadId,
  eventCallback,
}) => {
  const dispatch = useAppDispatch();

  return message.isArtifactCandidate ? (
    <div className={style.artifactButtons}>
      <Button
        color="gray"
        size="s"
        type="secondary"
        onClick={() => {
          dispatch(setPendingArtifactMessage(message));
          eventCallback(threadId, EVENTS.AI_ARTIFACT_CREATE_CLICKED);
        }}
        aria-label={'Create artifact'}
        iconLeft={{iconName: 'shapes'}}
        text="Create artifact"
      />
      <br />
      <a
        href="https://support.code.org/hc/en-us/articles/43794573137805-Artifacts-in-AI-Teaching-Assistant"
        target="_blank"
        rel="noreferrer"
      >
        What is an artifact?
        <FontAwesomeV6Icon iconName="arrow-up-right-from-square" />
      </a>
    </div>
  ) : null;
};

export default AiDiffCreateArtifactButtons;
