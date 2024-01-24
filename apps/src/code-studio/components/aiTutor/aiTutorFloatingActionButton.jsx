import React, {useState} from 'react';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import style from '@cdo/apps/templates/rubrics/rubrics.module.scss';
import aiFabIcon from '@cdo/static/ai-fab-background.png';
import AITutorPanel from './aiTutorPanel';

function AITutorFloatingActionButton() {
  const store = getStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const level = {
    id: 123,
    type: 'Javalab',
    hasValidation: true,
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
      <Provider store={store}>
        <AITutorPanel level={level} open={isOpen} />
      </Provider>
    </div>
  );
}

export default AITutorFloatingActionButton;
