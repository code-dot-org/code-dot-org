import $ from 'jquery';
import designMode from './designMode';

export default function autogenerateML(modelId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `/api/v1/ml_models/${modelId}`,
      method: 'GET'
    })
      .then(modelData => {
        var x = 20;
        var y = 20;
        var SPACE = 20;
        designMode.onInsertEvent(`var testValues = {};`);
        modelData.selectedFeatures.forEach(feature => {
          y = y + SPACE;
          var label = designMode.createElement('LABEL', x, y);
          label.textContent = feature + ':';
          label.id = 'design_' + feature + '_label';
          label.style.width = '300px';
          y = y + SPACE;
          if (Object.keys(modelData.featureNumberKey).includes(feature)) {
            var selectId = feature + '_dropdown';
            var select = designMode.createElement('DROPDOWN', x, y);
            select.id = 'design_' + selectId;
            // App Lab automatically addss "option 1" and "option 2", remove them.
            select.options.remove(0);
            select.options.remove(0);
            Object.keys(modelData.featureNumberKey[feature]).forEach(option => {
              var optionElement = document.createElement('option');
              optionElement.text = option;
              select.options.add(optionElement);
            });
          } else {
            var input = designMode.createElement('TEXT_INPUT');
            input.id = 'design_' + feature + '_input';
          }
          var addFeature = `testValues.${feature} = getText("${selectId}");`;
          designMode.onInsertEvent(addFeature);
        });
        y = y + 2 * SPACE;
        var label = designMode.createElement('LABEL', x, y);
        label.textContent = modelData.labelColumn;
        // TODO: this could be problematic if the name isn't formatted appropriately
        label.id = 'design_' + modelData.name + '_label';
        label.style.width = '300px';
        y = y + SPACE;
        var predictionId = modelData.name + '_prediction';
        var prediction = designMode.createElement('TEXT_INPUT', x, y);
        prediction.id = 'design_' + predictionId;
        y = y + 2 * SPACE;
        var predictButton = designMode.createElement('BUTTON', x, y);
        predictButton.textContent = 'Predict';
        var predictButtonId = modelData.name + '_predict';
        designMode.updateProperty(predictButton, 'id', predictButtonId);
        var predictOnClick = `onEvent("${predictButtonId}", "click", function() {
          getPrediction("${
            modelData.name
          }", "${modelId}", testValues, function(value) {
            setText("${predictionId}", value);
          });
        });`;
        designMode.onInsertEvent(predictOnClick);
        return resolve();
      })
      .fail((jqXhr, status) => {
        return alert({message: 'An error occurred'});
      });
  });
}
