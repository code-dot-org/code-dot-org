import React from 'react';
import style from '@cdo/apps/templates/rubrics/rubrics.module.scss';
import aiFabIcon from '@cdo/static/ai-fab-background.png';

function AITutorFloatingActionButton() {
  //const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    console.log('clicked the ai tutor floating action button!');
  };

  return (
    <div id="fab-contained">
      <button
        id="ui-floatingActionButton"
        className={style.floatingActionButton}
        // I couldn't get an image url to work in the SCSS module, so using an inline style for now
        style={{backgroundImage: `url(${aiFabIcon})`}}
        onClick={handleClick}
        type="button"
      />
    </div>
  );
}

export default AITutorFloatingActionButton;
