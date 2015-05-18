// TODO (brent) - this file will go away eventually

var React = require('react');

var PropertyRow = require('./PropertyRow');

var TextInputProperties = React.createClass({
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
          desc={'text'}
          initialValue={text}
          handleChange={this.props.handleChange.bind(this, 'text')} />
        <PropertyRow
          desc={'width (px)'}
          initialValue={width}
          handleChange={this.props.handleChange.bind(this, 'width')} />
        <PropertyRow
          desc={'height (px)'}
          initialValue={height}
          handleChange={this.props.handleChange.bind(this, 'height')} />
        <PropertyRow
          desc={'x position (px)'}
          initialValue={left}
          handleChange={this.props.handleChange.bind(this, 'left')} />
        <PropertyRow
          desc={'y position (px)'}
          initialValue={top}
          handleChange={this.props.handleChange.bind(this, 'top')} />
      </table>);
  }
});

function createElement() {
  var element = document.createElement('input');
  element.style.margin = '5px 2px';
  element.style.width = '236px';
  element.style.height = '30px';

  return element;
}

module.exports = {
  create: createElement,
  PropertyTable: TextInputProperties
};
