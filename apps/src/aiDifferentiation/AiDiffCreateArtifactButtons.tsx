import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import {ChatTextMessage} from './types';

import style from './ai-differentiation.module.scss';

interface Props {
  message: ChatTextMessage;
}

const AiDiffCreateArtifactButtons: React.FC<Props> = ({message}) => {
  return message.artifactSuggestion ? (
    <div className={style.artifactButtons}>
      <Button
        color="gray"
        size="s"
        type="secondary"
        onClick={() => {}}
        aria-label={'fnord'}
        iconLeft={{iconName: 'shapes'}}
        text="Create artifact"
      />
      <Button
        color="gray"
        size="s"
        type="secondary"
        onClick={() => {}}
        aria-label={'fnord'}
        iconLeft={{iconName: 'rotate'}}
        text="Regenerate"
      />
      <br />
      <a href="#">
        What is an artifact?
        <FontAwesomeV6Icon iconName="arrow-up-right-from-square" />
      </a>
    </div>
  ) : null;
};

export default AiDiffCreateArtifactButtons;
