import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import PropertyRow from './PropertyRow';
import MLModelPickerPropertyRow from './MLModelPickerPropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import BorderProperties from './BorderProperties';
import themeValues from '../themeValues';
import * as elementUtils from './elementUtils';
import designMode from '../designMode';
import elementLibrary from './library';

class PredictPanelProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
    mlModelDetails: PropTypes.object
  };

  render() {
    const element = this.props.element;

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow
        />
        <MLModelPickerPropertyRow
          desc={'model ID'}
          initialValue={element.getAttribute('data-modelid')}
          handleChange={this.props.handleChange.bind(this, 'modelId')}
          /*isMLRow*/
        />
        <PropertyRow
          desc={'width (px)'}
          isNumber
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')}
        />
        <PropertyRow
          desc={'height (px)'}
          isNumber
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')}
        />
        <PropertyRow
          desc={'x position (px)'}
          isNumber
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')}
        />
        <PropertyRow
          desc={'y position (px)'}
          isNumber
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')}
        />
        <ColorPickerPropertyRow
          desc={'background color'}
          initialValue={elementUtils.rgb2hex(element.style.backgroundColor)}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')}
        />
        <ColorPickerPropertyRow
          desc={'icon color'}
          initialValue={elementUtils.rgb2hex(element.style.color || '#000000')}
          handleChange={this.props.handleChange.bind(this, 'textColor')}
        />
        <PropertyRow
          desc={'icon size (px)'}
          isNumber
          initialValue={parseInt(element.style.fontSize, 10)}
          handleChange={this.props.handleChange.bind(this, 'fontSize')}
        />
        <BorderProperties
          element={element}
          handleBorderWidthChange={this.props.handleChange.bind(
            this,
            'borderWidth'
          )}
          handleBorderColorChange={this.props.handleChange.bind(
            this,
            'borderColor'
          )}
          handleBorderRadiusChange={this.props.handleChange.bind(
            this,
            'borderRadius'
          )}
        />
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')}
        />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}
        />
      </div>
    );
  }
}

class PredictPanelEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  };

  getInitPredictCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'initPredictPanel("' +
      id +
      '", function() {\n\tconsole.log("Predict panel ${id} loaded.");\n});';

    return code;
  }

  getOnPredictCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'onPredict("' +
      id +
      '", function() {\n\tconsole.log("Predict for ${id} occurred.");\n});';

    return code;
  }

  insertInitPredict = () => {
    this.props.onInsertEvent(this.getInitPredictCode());
  };

  insertOnPredict = () => {
    this.props.onInsertEvent(this.getOnPredictCode());
  };

  render() {
    const element = this.props.element;
    const initPredictName = 'initPredictPanel';
    const initPredictDesc = 'Initialize.';
    const onPredictName = 'onPrediction';
    const onPredictDesc = 'Handle a prediction.';

    return (
      <div id="eventRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <EventHeaderRow />
        <EventRow
          name={initPredictName}
          desc={initPredictDesc}
          handleInsert={this.insertInitPredict}
        />
        <EventRow
          name={onPredictName}
          desc={onPredictDesc}
          handleInsert={this.insertOnPredict}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: PredictPanelProperties,
  EventTab: PredictPanelEvents,
  themeValues: themeValues.photoSelect,

  create: function() {
    const element = document.createElement('div');

    const predictButton = document.createElement('button');
    predictButton.textContent = 'Predict';
    element.appendChild(predictButton);

    element.setAttribute('class', 'predict-panel');
    element.style.margin = '0';
    element.style.borderStyle = 'solid';
    element.style.overflow = 'hidden';

    elementLibrary.setAllPropertiesToCurrentTheme(
      element,
      designMode.activeScreen()
    );
    element.style.padding = '0';
    element.style.textAlign = 'center';
    element.style.fontSize = '32px';

    element.style.width = '75px';
    element.style.height = '50px';
    //element.style.display = 'flex';
    //element.style.alignItems = 'center';
    //element.style.justifyContent = 'center';
    return element;
  },
  onDeserialize: function(element, updateProperty) {
    // Disable image upload events unless running
    $(element).on('click', () => {
      element.childNodes[0].disabled = !Applab.isRunning();
    });
  }
};
