// TODO (brent) - hook up linter somewhere

var React = require('react');

var PropertyRow = require('./PropertyRow');

var ButtonProperties = React.createClass({
  propTypes: {
    // TODO (brent) prob need a custom validator for html element
    // even better if we ensure it's a button element
    // element: React.PropTypes.element.isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

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

    // TODO:
    // textColor
    // backgroundColor
    // fontSize
    // image
    // bold/italics/underline (p2)
    // shape (p2)
    // textAlignment (p2)
    // enabled (p2)
    // hidden
    // send back/forward
  }
});

function createElement() {
  var element = document.createElement('button');
  element.appendChild(document.createTextNode('Button'));
  element.style.padding = '0px';
  element.style.margin = '2px';
  element.style.height = '36px';
  element.style.width = '76px';
  element.style.fontSize = '14px';

  return element;
}

// TODO (brent) how do i want to organize exports?
module.exports = {
  create: createElement,
  PropertyTable: ButtonProperties
};
