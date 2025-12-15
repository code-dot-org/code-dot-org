import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import style from './ai-differentiation.module.scss';

interface Props {
  messageId: number;
}

const AiDiffCreateArtifactButtons: React.FC<Props> = ({messageId}) => {
  return (
    <div className={style.artifactButtons}>
      messageId
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
  );
};

export default AiDiffCreateArtifactButtons;
