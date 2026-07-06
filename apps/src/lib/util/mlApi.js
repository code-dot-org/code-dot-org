import $ from 'jquery';

import localization from '@cdo/apps/localization';
import {predict} from '@cdo/apps/MLTrainers';

export const commands = {
  async getPrediction(opts) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/api/v1/ml_models/' + opts.modelId,
        method: 'GET',
      })
        .then(modelData => {
          const predictParams = {
            ...modelData,
            label: modelData.label.values
              ? {
                  ...modelData.label,
                  values: modelData.label.values.map(value =>
                    localization.translate(value)
                  ),
                }
              : modelData.label,
            testData: opts.testValues,
          };
          // We must localize the model data so that it will match the provided test values
          predictParams.features = (predictParams.features || []).map(feature =>
            feature.values
              ? {
                  ...feature,
                  values: feature.values.map(value =>
                    localization.translate(value)
                  ),
                }
              : feature
          );
          // And then localize the keys that the model uses to map feature values to numerical values
          if (predictParams.featureNumberKey) {
            predictParams.featureNumberKey = Object.fromEntries(
              Object.entries(predictParams.featureNumberKey).map(
                ([column, keys]) => [
                  column,
                  Object.fromEntries(
                    Object.entries(keys).map(([key, value]) => [
                      localization.translate(key),
                      value,
                    ])
                  ),
                ]
              )
            );
          }
          const result = predict(predictParams);
          opts.callback(result);
          return resolve();
        })
        .fail((jqXhr, status) => {
          opts.callback('Error: prediction failed');
          return reject({message: 'An error occurred'});
        });
    });
  },
};
