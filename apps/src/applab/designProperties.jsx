var React = require('react')

var PropertyRow = React.createClass({
  handleChangeInternal: function(event) {
    var value = event.target.value;
    this.props.handleChange(value);
  },
  render: function() {
    return <tr>
        <td>{this.props.desc}</td>
        <td>
          <input
            defaultValue={this.props.initialValue}
            onChange={this.handleChangeInternal}/></td>
      </tr>
  }
});

var DesignProperties = module.exports = React.createClass({
  render: function() {
    if (this.props.tagName) {
      return <div>
        <table>
          <tr>
            <th>name</th>
            <th>value</th>
          </tr>
          <PropertyRow
              desc={'id'} initialValue={this.props['id']}
              handleChange={this.props.handleChange.bind(this, 'id')} />
          <PropertyRow
              desc={'x position (px)'} initialValue={this.props['left']}
              handleChange={this.props.handleChange.bind(this, 'left')} />
          <PropertyRow
              desc={'y position (px)'} initialValue={this.props['top']}
              handleChange={this.props.handleChange.bind(this, 'top')} />
          <PropertyRow
              desc={'width (px)'} initialValue={this.props['width']}
              handleChange={this.props.handleChange.bind(this, 'width')} />
          <PropertyRow
              desc={'height (px)'} initialValue={this.props['height']}
              handleChange={this.props.handleChange.bind(this, 'height')} />
          <PropertyRow
              desc={'text'} initialValue={this.props['text']}
              handleChange={this.props.handleChange.bind(this, 'text')} />
        </table>
        <button id="donePropertiesButton" class="share" onClick={this.props.onDone}>Done</button>
        <button id="deletePropertiesButton" class="share" onClick={this.props.onDelete}>Delete</button>
      </div>
    } else {
      return <p>Click on an element to edit its properties.</p>;
    }
  }
});
