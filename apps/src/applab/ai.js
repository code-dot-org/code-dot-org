import $ from 'jquery';
import designMode from './designMode';
import {stripSpaceAndSpecial} from '@cdo/apps/aiUtils';

function generateCodeDesignElements(modelId, modelData) {
  var x = 20;
  var y = 20;
  var SPACER_PIXELS = 20;
  designMode.onInsertEvent(`var data = {};`);
  var inputFields = [];
  modelData.selectedFeatures.forEach(feature => {
    y = y + SPACER_PIXELS;
    var label = designMode.createElement('LABEL', x, y);
    var alphaNumFeature = stripSpaceAndSpecial(feature);
    let fieldId;
    label.textContent = feature + ':';
    label.id = 'design_' + alphaNumFeature + '_label';
    label.style.width = '300px';
    y = y + SPACER_PIXELS;
    if (Object.keys(modelData.featureNumberKey).includes(feature)) {
      fieldId = alphaNumFeature + '_dropdown';
      var select = designMode.createElement('DROPDOWN', x, y);
      select.id = 'design_' + fieldId;
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
      var input = designMode.createElement('TEXT_INPUT', x, y);
      fieldId = alphaNumFeature + '_input';
      input.id = 'design_' + fieldId;
      y = y + SPACER_PIXELS;
    }
    var addFeature = `data.${alphaNumFeature} = getText("${fieldId}");`;
    inputFields.push(addFeature);
  });
  y = y + 2 * SPACER_PIXELS;
  var label = designMode.createElement('LABEL', x, y);
  label.textContent = modelData.labelColumn;
  var alphaNumModelName = stripSpaceAndSpecial(modelData.name);
  label.id = 'design_' + alphaNumModelName + '_label';
  label.style.width = '300px';
  y = y + SPACER_PIXELS;
  var predictionId = alphaNumModelName + '_prediction';
  var prediction = designMode.createElement('TEXT_INPUT', x, y);
  prediction.id = 'design_' + predictionId;
  prediction.readOnly = true;
  y = y + 2 * SPACER_PIXELS;
  var predictButton = designMode.createElement('BUTTON', x, y);
  predictButton.textContent = 'Predict';
  var predictButtonId = alphaNumModelName + '_predict';
  designMode.updateProperty(predictButton, 'id', predictButtonId);
  var predictOnClick = `onEvent("${predictButtonId}", "click", function() {
    ${inputFields.join('\n\t\t')}
    setText("${predictionId}", '');
    getPrediction("${modelData.name}", "${modelId}", data, function(value) {
      setText("${predictionId}", value);
    });
  });`;
  designMode.onInsertAICode(predictOnClick);
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
