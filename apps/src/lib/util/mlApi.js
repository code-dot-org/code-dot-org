/* global Promise */

import $ from 'jquery';
import {predict} from '@cdo/apps/MLTrainers';

export const commands = {
  async getPrediction(opts) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/api/v1/ml_models/' + opts.modelId,
        method: 'GET'
      })
        .then(modelData => {
          const predictParams = {
            ...modelData,
            testData: opts.testValues
          };
          const result = predict(predictParams);
          opts.callback(result);
          return resolve();
        })
        .fail((jqXhr, status) => {
          opts.callback('Error: prediction failed');
          return reject({message: 'An error occurred'});
        });
    });
  }
};
