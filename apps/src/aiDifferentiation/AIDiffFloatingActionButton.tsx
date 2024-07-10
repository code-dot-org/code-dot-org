import React, {useState} from 'react';

import aiFabIcon from '@cdo/static/ai-fab-background.png';

import AiDiffContainer from './AiDiffContainer';

import style from './ai-differentiation.module.scss';

/**
 * Renders an AI Bot icon button in the bottom left corner over other UI elements that controls
 * toggling an AI element open and closed.
 */

const AiDiffFloatingActionButton: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div id="fab-contained">
      <button
        id="ui-floatingActionButton"
        className={style.floatingActionButton}
        onClick={handleClick}
        type="button"
      >
        <img alt="AI bot" src={aiFabIcon} />
      </button>
      <AiDiffContainer open={isOpen} closeTutor={handleClick} />
    </div>
  );
};

export default AiDiffFloatingActionButton;
