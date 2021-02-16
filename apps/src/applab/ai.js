import $ from 'jquery';
import designMode from './designMode';

function generateCodeDesignElements(modelId, modelData) {
  var x = 20;
  var y = 20;
  var SPACER_PIXELS = 20;
  designMode.onInsertEvent(`var testValues = {};`);
  modelData.selectedFeatures.forEach(feature => {
    y = y + SPACER_PIXELS;
    var label = designMode.createElement('LABEL', x, y);
    // Strip whitespace and special characters.
    var alphaNumFeature = feature.replace(/\W/g, '');
    label.textContent = feature + ':';
    label.id = 'design_' + alphaNumFeature + '_label';
    label.style.width = '300px';
    y = y + SPACER_PIXELS;
    if (Object.keys(modelData.featureNumberKey).includes(feature)) {
      var selectId = alphaNumFeature + '_dropdown';
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
      y = y + SPACER_PIXELS;
    } else {
      var input = designMode.createElement('TEXT_INPUT');
      input.id = 'design_' + alphaNumFeature + '_input';
      y = y + SPACER_PIXELS;
    }
    var addFeature = `testValues.${alphaNumFeature} = getText("${selectId}");`;
    designMode.onInsertEvent(addFeature);
  });
  y = y + 2 * SPACER_PIXELS;
  var label = designMode.createElement('LABEL', x, y);
  label.textContent = modelData.labelColumn;
  var alphaNumModelName = modelData.name.replace(/\W/g, '');
  label.id = 'design_' + alphaNumModelName + '_label';
  label.style.width = '300px';
  y = y + SPACER_PIXELS;
  var predictionId = alphaNumModelName + '_prediction';
  var prediction = designMode.createElement('TEXT_INPUT', x, y);
  prediction.id = 'design_' + predictionId;
  y = y + 2 * SPACER_PIXELS;
  var predictButton = designMode.createElement('BUTTON', x, y);
  predictButton.textContent = 'Predict';
  var predictButtonId = alphaNumModelName + '_predict';
  designMode.updateProperty(predictButton, 'id', predictButtonId);
  var predictOnClick = `onEvent("${predictButtonId}", "click", function() {
    getPrediction("${
      modelData.name
    }", "${modelId}", testValues, function(value) {
      setText("${predictionId}", value);
    });
  });`;
  designMode.onInsertEvent(predictOnClick);
}

export default function autogenerateML(modelId) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: `/api/v1/ml_models/${modelId}`,
      method: 'GET'
    })
      .then(modelData => {
        generateCodeDesignElements(modelId, modelData);
        return resolve();
      })
      .fail((jqXhr, status) => {
        return alert({message: 'An error occurred'});
      });
  });
}
