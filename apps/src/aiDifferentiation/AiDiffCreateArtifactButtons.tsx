import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {setPendingArtifactMessage} from '@cdo/apps/aichat/redux/slice';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {ChatTextMessage} from './types';

import style from './ai-differentiation.module.scss';

interface Props {
  message: ChatTextMessage;
}

const AiDiffCreateArtifactButtons: React.FC<Props> = ({message}) => {
  const dispatch = useAppDispatch();

  return message.isArtifactCandidate ? (
    <div className={style.artifactButtons}>
      <MuiButton
        variant="outlined"
        color="tertiary"
        size="small"
        onClick={() => dispatch(setPendingArtifactMessage(message))}
        aria-label="Create artifact"
        type="button"
        startIcon={<FontAwesomeV6Icon iconName="shapes" />}
      >
        {'Create artifact'}
      </MuiButton>
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
