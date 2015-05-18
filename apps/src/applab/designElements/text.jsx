var React = require('react');

var PropertyRow = require('./PropertyRow.jsx');

var TextProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;
    var id = element.id;
    var text = $(element).text();

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

    // TODO:
    // link
    // textColor
    // backgroundColor
    // fontSize
    // bold/italics/underline (p2)
    // textAlignment (p2)
    // enabled (p2)
    // hidden
    // send back/forward
  }
});

module.exports = {
  PropertyTable: TextProperties,

  create: function() {
    var element = document.createElement('label');
    element.appendChild(document.createTextNode("text"));
    element.style.margin = '10px 5px';
    element.style.height = '20px';

    return element;
  }
};
