import $ from 'jquery';
import 'babel-polyfill';
import {setState} from '../state';
import {Modes} from '../constants';
import {init as initScene} from '../init';

const onChangeWord = event => {
  setState({word: event.target.value, currentMode: Modes.Training});
  initScene();
};

const createDropdowns = () => {
  const listData = [
    {
      type: 'color',
      title: 'Color',
      options: ['blue', 'green', 'red', 'yellow']
    },
    {
      type: 'shape',
      title: 'Shape',
      options: ['narrow', 'round', 'sharp', 'square', 'wide', 'spiky']
    },
    {
      type: 'type',
      title: 'Type',
      options: ['bizarre', 'fast', 'scary', 'funny', 'glitchy']
    },
    {
      type: 'personality',
      title: 'Personality',
      options: [
        'angry',
        'brave',
        'fierce',
        'friendly',
        'fun',
        'shy',
        'smart',
        'wild'
      ]
    }
  ];

  let results = [];
  for (var i = 0; i < 4; i++) {
    const listItem = listData[i];
    var selectList = document.createElement('select');
    $(selectList).append(
      `<option selected disabled>${listItem.title}</option>`
    );
    for (var j = 0; j < listItem.options.length; j++) {
      const option = listItem.options[j];
      $(selectList).append(`<option value="${option}">${option}</option>`);
    }
    selectList.setAttribute('id', `select-${listItem.type}`);
    selectList.setAttribute('class', 'ui-centered-select');
    selectList.addEventListener('change', onChangeWord, false);
    results.push(selectList);
  }
  return results;
};

const uiElements = createDropdowns();

export const init = () => {
  setState({uiElements});
};
