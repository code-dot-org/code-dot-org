import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import BooleanPropertyRow from './BooleanPropertyRow';
import * as elementUtils from './elementUtils';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import PropertyRow from './PropertyRow';
import ZOrderRow from './ZOrderRow';

class ChartProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
  };

  render() {
    const element = this.props.element;

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_widthPx()}
          isNumber={true}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_heightPx()}
          isNumber={true}
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_xPositionPx()}
          isNumber={true}
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_yPositionPx()}
          isNumber={true}
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')}
        />
        <BooleanPropertyRow
          desc={applabMsg.designElementProperty_hidden()}
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

class ChartEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
  };

  getDrawChartCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'drawChart("' +
      id +
      '", "bar", ' +
      '[\n\t{ label: "Row 1", value: 1 },\n\t{ label: "Row 2", value: 2 }\n]);\n';
    return code;
  }

  getDrawChartFromRecordsCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'drawChartFromRecords("' +
      id +
      '", "bar", "tableName", ' +
      '["columnOne", "columnTwo"]);\n';
    return code;
  }

  insertDrawChart = () => {
    this.props.onInsertEvent(this.getDrawChartCode());
  };

  insertDrawChartFromRecords = () => {
    this.props.onInsertEvent(this.getDrawChartFromRecordsCode());
  };

  render() {
    const element = this.props.element;

    return (
      <div id="eventRowContainer">
        <PropertyRow
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <EventHeaderRow />
        <EventRow
          name={applabMsg.designElement_chart_drawEvent()}
          desc={applabMsg.designElement_chart_drawEventDesc()}
          handleInsert={this.insertDrawChart}
        />
        <EventRow
          name={applabMsg.designElement_chart_drawFromRecordsEvent()}
          desc={applabMsg.designElement_chart_drawFromRecordsEventDesc()}
          handleInsert={this.insertDrawChartFromRecords}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: ChartProperties,
  EventTab: ChartEvents,

  create: function () {
    const element = document.createElement('div');
    element.setAttribute('class', 'chart');
    element.style.height = '100px';
    element.style.width = '100px';

    return element;

    // Note: we use CSS to make this element have a background in design mode
    // but not in code mode.
  },
};
