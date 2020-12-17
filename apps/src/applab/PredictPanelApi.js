/**
 * @file Core implementation of Applab commands related to the PredictPanel design element.
 *
 */

/* global Promise */

import elementLibrary from './designElements/library';
import {predict} from '../MLTrainers';

const PredictPanelApi = {};

PredictPanelApi.predictCallback = null;
PredictPanelApi.modelData = null;

PredictPanelApi.init = function(predictPanelId, data) {
  try {
    var targetElement = document.getElementById(predictPanelId);
    if (!targetElement || 'div' !== targetElement.tagName.toLowerCase()) {
      throw new Error(
        'Unable to render PredictPanel into element "' + targetElement + '".'
      );
    }

    const modelId = targetElement.getAttribute('data-modelid');

    targetElement.innerHTML = '';

    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/api/v1/ml_models/' + modelId,
        method: 'GET'
      })
        .success(data => {
          this.renderPanel(targetElement, data);

          this.modelData = data;

          return resolve();
        })
        .fail((jqXhr, status) => {
          return reject({message: 'An error occurred'});
        });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

PredictPanelApi.renderPanel = function(targetElement, data) {
  /*data = {
    selectedTrainer: 'knnClassify',
    trainedModel: {},
    name: 'Titanic 5',
    description: 'more details...',
    summaryStat: {
      type: 'classification',
      stat: '67.05'
    },
    featureNumberKey: {
      Survived: {
        '0': 0,
        '1': 1
      },
      Pclass: {
        '1': 1,
        '2': 2,
        '3': 0
      },
      Sex: {
        male: 0,
        female: 1
      }
    },
    labelColumn: 'Survived',
    selectedFeatures: ['Pclass', 'Sex', 'Age']
  };*/

  for (let selectedFeature of data.selectedFeatures) {
    if (data.featureNumberKey.hasOwnProperty(selectedFeature)) {
      const label = document.createElement('label');
      label.setAttribute('for', selectedFeature);
      label.textContent = selectedFeature;
      targetElement.appendChild(label);

      const select = document.createElement('select');
      select.id = selectedFeature;

      elementLibrary.setAllPropertiesToCurrentTheme(
        select,
        Applab.activeScreen()
      );

      for (let featureNumberKey of Object.keys(
        data.featureNumberKey[selectedFeature]
      )) {
        const option = document.createElement('option');
        option.innerHTML = featureNumberKey;

        select.appendChild(option);
      }

      targetElement.appendChild(select);
    } else {
      const label = document.createElement('label');
      label.setAttribute('for', selectedFeature);
      label.textContent = selectedFeature;
      targetElement.appendChild(label);

      const input = document.createElement('input');
      input.setAttribute('name', selectedFeature);
      input.id = selectedFeature;
      targetElement.appendChild(input);
    }
  }

  const predictButton = document.createElement('button');
  predictButton.textContent = 'Predict';

  predictButton.addEventListener('click', this.onPredictClick.bind(this));

  targetElement.appendChild(predictButton);
};

PredictPanelApi.setOnPredictCallback = function(callback) {
  this.predictCallback = callback;
};

PredictPanelApi.onPredictClick = function() {
  //const age = document.querySelector('#predict_panel1 #Age').value;
  //const sex = document.querySelector('#predict_panel1 #Sex').value;
  const nougat = document.querySelector('#predict_panel1 #nougat').value;

  //console.log(age, sex);

  const fullModelData = {
    ...this.modelData,
    testData: {nougat: parseInt(nougat)}
  };

  const result = predict(fullModelData);
  console.log('predict result: ', result);

  this.predictCallback(result);
};

export default PredictPanelApi;
