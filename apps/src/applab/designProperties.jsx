var React = require('react')

var DesignProperties = module.exports = React.createClass({
  render: function() {
    if (this.props.tagName) {
      return <div>
        <table>
          <tr>
            <th>name</th>
            <th>value</th>
          </tr>
          <tr>
            <td>id</td>
            <td><input id="design-property-id" value={this.props.id}/></td>
          </tr>
          <tr>
            <td>x position (px)</td>
            <td><input id="design-property-left" value={this.props.left}/></td>
          </tr>
          <tr>
            <td>y position (px)</td>
            <td><input id="design-property-top" value={this.props.top}/></td>
          </tr>
          <tr>
            <td>width (px)</td>
            <td><input id="design-property-width" value={this.props.width}/></td>
          </tr>
          <tr>
            <td>height (px)</td>
            <td><input id="design-property-height" value={this.props.height}/></td>
          </tr>
          <tr>
            <td>text</td>
            <td><input id="design-property-text" value={this.props.text}/></td>
          </tr>
        </table>
        <button id="savePropertiesButton" class="share">Save</button>
        <button id="deletePropertiesButton" class="share">Delete</button>
      </div>
    } else {
      return <p>Click on an element to edit its properties.</p>;
    }
  }
});
