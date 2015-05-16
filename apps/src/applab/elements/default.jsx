// TODO (brent) - this file will go away eventually

var React = require('react');

var PropertyRow = require('./PropertyRow');

var DefaultProperties = React.createClass({
  render: function () {
    var element = this.props.element;
    var id = element.id;
    var text = $(element).text();

    // TODO (brent): move getOuterWidth/getOuterHeight
    var outerWidth = Applab.getOuterWidth(element);
    var outerHeight = Applab.getOuterHeight(element);
    var width = isNaN(outerWidth) ? '' : outerWidth;
    var height = isNaN(outerHeight) ? '' : outerHeight;

    var left = parseInt(element.style.left, 10) || 0;
    var top = parseInt(element.style.top, 10) || 0;

    // TODO - can we do better than depend on HTML elements having unique ids?

    return (
      <table>
        <tr>
          <th>name</th>
          <th>value</th>
        </tr>
        <PropertyRow
          desc={'id'}
          initialValue={id}
          handleChange={this.props.handleChange.bind(this, 'id')} />
        <PropertyRow
          desc={'x position (px)'}
          initialValue={left}
          handleChange={this.props.handleChange.bind(this, 'left')} />
        <PropertyRow
          desc={'y position (px)'}
          initialValue={top}
          handleChange={this.props.handleChange.bind(this, 'top')} />
        <PropertyRow
          desc={'width (px)'}
          initialValue={width}
          handleChange={this.props.handleChange.bind(this, 'width')} />
        <PropertyRow
          desc={'height (px)'}
          initialValue={height}
          handleChange={this.props.handleChange.bind(this, 'height')} />
        <PropertyRow
          desc={'text'}
          initialValue={text}
          handleChange={this.props.handleChange.bind(this, 'text')} />
      </table>);
  }
});

module.exports = {
  DefaultProperties: DefaultProperties
};
