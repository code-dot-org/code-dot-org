import React, {useState} from 'react';

import aiFabIcon from '@cdo/static/ai-fab-background.png';

import AIDiffContainer from './AIDiffContainer';

import style from './ai-component.module.scss';

/**
 * Renders an AI Bot icon button in the bottom left corner over other UI elements that controls
 * toggling an AI element open and closed.
 */

const AIFloatingActionButton: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div id="fab-contained">
      <button
        id="ui-floatingActionButton"
        className={style.floatingActionButton}
        style={{backgroundImage: `url(${aiFabIcon})`}}
        onClick={handleClick}
        type="button"
      />
      <AIDiffContainer open={isOpen} closeTutor={handleClick} />
    </div>
  );
};

export default AIFloatingActionButton;
