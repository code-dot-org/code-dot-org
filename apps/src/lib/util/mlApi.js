/* global Promise */

import {predict} from '@cdo/apps/MLTrainers';

export const commands = {
  async getPrediction(opts) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/api/v1/ml_models/names',
        method: 'GET'
      })
        .then(data => {
          const modelId = data.find(model => model.name === opts.model).id;
          $.ajax({
            url: '/api/v1/ml_models/' + modelId,
            method: 'GET'
          }).then(modelData => {
            const predictParams = {
              ...modelData,
              testData: opts.testValues
            };
            const result = predict(predictParams);
            opts.callback(result);
          });
          return resolve();
        })
        .fail((jqXhr, status) => {
          return reject({message: 'An error occurred'});
        });
    });
  }
};
