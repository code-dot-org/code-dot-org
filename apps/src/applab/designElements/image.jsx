var React = require('react');

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZIndexRow = require('./ZIndexRow.jsx');

var elementUtils = require('./elementUtils');

var ImageProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      <table>
        <tr>
          <th>name</th>
          <th>value</th>
        </tr>
        <PropertyRow
          desc={'id'}
          initialValue={element.id}
          handleChange={this.props.handleChange.bind(this, 'id')} />
        <PropertyRow
          desc={'text'}
          initialValue={$(element).text()}
          handleChange={this.props.handleChange.bind(this, 'text')} />
        <PropertyRow
          desc={'width (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'width')} />
        <PropertyRow
          desc={'height (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'height')} />
        <PropertyRow
          desc={'x position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')} />
        <PropertyRow
          desc={'y position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')} />
        {/* eventually this will be a ImageChooserPropertyRow */ }
        <PropertyRow
          desc={'picture'}
          initialValue={element.getAttribute('src')}
          handleChange={this.props.handleChange.bind(this, 'picture')} />
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')} />
        <ZIndexRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}/>
      </table>);

    // TODO (brent):
    // bold/italics/underline (p2)
    // shape (p2)
    // textAlignment (p2)
    // enabled (p2)
    // send back/forward
  }
});

module.exports = {
  PropertyTable: ImageProperties,
  create: function () {
    var element = document.createElement('img');
    element.style.height = '50px';
    element.style.width = '50px';
    element.setAttribute('src', '');

    return element;
  }
};
