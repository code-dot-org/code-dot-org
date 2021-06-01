import $ from 'jquery';
import designMode from './designMode';
import {stripSpaceAndSpecial} from '@cdo/apps/aiUtils';

function generateCodeDesignElements(modelId, modelData) {
  var x = 20;
  var y = 0;
  var SPACER_PIXELS = 18;

  const modelClass = 'ml_model_' + modelId;

  // Delete any prior DOM elements for this modelId.
  // (As done in deleteElement() in designMode.js, we might
  // actually remove the parent which handled resizing.)
  var existingElements = $('.' + modelClass);
  existingElements.each((index, element) => {
    if ($(element.parentNode).is('.ui-resizable')) {
      element = element.parentNode;
    }
    element.remove();
  });

  designMode.onInsertEvent(`var data = {};`);
  var inputFields = [];
  modelData.features.forEach(feature => {
    y = y + SPACER_PIXELS;
    var label = designMode.createElement('LABEL', x, y);
    var alphaNumFeature = stripSpaceAndSpecial(feature.id);
    let fieldId;
    label.id = 'design_' + alphaNumFeature + '_label';
    label.className = modelClass;
    label.style.width = '300px';
    y = y + SPACER_PIXELS;
    if (feature.values) {
      // Create dropdown menu for each categorical feature.
      label.textContent = feature.id + ':';
      fieldId = alphaNumFeature + '_dropdown';
      var select = designMode.createElement('DROPDOWN', x, y);
      select.id = 'design_' + fieldId;
      select.className = modelClass;
      // App Lab automatically adds "option 1" and "option 2", remove them.
      select.options.remove(0);
      select.options.remove(0);
      feature.values.forEach(option => {
        var optionElement = document.createElement('option');
        optionElement.text = option;
        select.options.add(optionElement);
      });
      y = y + SPACER_PIXELS;
    } else {
      // Create text input field for each continuous feature.
      label.textContent = feature.id;
      var input = designMode.createElement('TEXT_INPUT', x, y);
      var min = feature.min.toFixed(2);
      var max = feature.max.toFixed(2);
      var maxMinPlaceholder = `min: ${+min}, max: ${+max}`;
      designMode.updateProperty(input, 'placeholder', maxMinPlaceholder);
      fieldId = alphaNumFeature + '_input';
      input.id = 'design_' + fieldId;
      input.className = modelClass;
      y = y + SPACER_PIXELS;
    }
    var addFeature = `addPair(data, "${alphaNumFeature}", getText("${fieldId}"));`;
    inputFields.push(addFeature);
  });
  y = y + 2 * SPACER_PIXELS;
  var label = designMode.createElement('LABEL', x, y);
  label.textContent = modelData.labelColumn;
  var alphaNumModelName = stripSpaceAndSpecial(modelData.name);
  label.id = 'design_' + alphaNumModelName + '_label';
  label.className = modelClass;
  label.style.width = '300px';
  var predictionId = alphaNumModelName + '_prediction';
  // Button to do the prediction.
  var predictButton = designMode.createElement('BUTTON', x, y);
  predictButton.textContent = 'Predict';
  var predictButtonId = alphaNumModelName + '_predict';
  designMode.updateProperty(predictButton, 'id', predictButtonId);
  predictButton.className = modelClass;
  var predictOnClick = `onEvent("${predictButtonId}", "click", function() {
    ${inputFields.join('\n\t\t')}
    setText("${predictionId}", '');
    getPrediction("${modelData.name}", "${modelId}", data, function(value) {
      setText("${predictionId}", value);
    });
  });`;
  y = y + 2.5 * SPACER_PIXELS;
  // Text input field to display prediction.
  var prediction = designMode.createElement('TEXT_INPUT', x, y);
  prediction.id = 'design_' + predictionId;
  prediction.className = modelClass;
  prediction.readOnly = true;

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
