// TODO (brent) - hook up linter somewhere

var React = require('react');

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');

var ButtonProperties = React.createClass({
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

    var hidden = $(element).hasClass('design-mode-hidden');

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
        <PropertyRow
          desc={'text color'}
          initialValue='black'
          hasColorPicker={true}
          handleChange={this.props.handleChange.bind(this, 'textColor')} />
        <PropertyRow
          desc={'background color'}
          initialValue='#eee'
          hasColorPicker={true}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')} />
        <PropertyRow
          desc={'font size (px)'}
          initialValue='14'
          handleChange={this.props.handleChange.bind(this, 'fontSize')} />
        <PropertyRow
          desc={'image'}
          initialValue=''
          hasImageChooser={true}
          handleChange={this.props.handleChange.bind(this, 'imageChooser')} />
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={hidden}
          handleChange={this.props.handleChange.bind(this, 'hidden')} />
      </table>);

    // TODO:
    // bold/italics/underline (p2)
    // shape (p2)
    // textAlignment (p2)
    // enabled (p2)
    // send back/forward
  }
});

module.exports = {
  PropertyTable: ButtonProperties,
  create: function () {
    var element = document.createElement('button');
    element.appendChild(document.createTextNode('Button'));
    element.style.padding = '0px';
    element.style.margin = '2px';
    element.style.height = '36px';
    element.style.width = '76px';
    element.style.fontSize = '14px';

    return element;
  }
};
