var React = require('react')

var PropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.oneOfType([
      React.PropTypes.string.isRequired,
      React.PropTypes.number.isRequired
    ]),
    handleChange: React.PropTypes.func
  },
  handleChangeInternal: function(event) {
    var value = event.target.value;
    this.props.handleChange(value);
  },
  render: function() {
    return (
      <tr>
        <td>{this.props.desc}</td>
        <td>
          <input
            defaultValue={this.props.initialValue}
            onChange={this.handleChangeInternal}/>
        </td>
      </tr>
    );
  }
});

var DesignProperties = module.exports = React.createClass({
  // TODO (brent): might be that we don't actually want these if we're going
  // to be more flexible about what props we get
  // might also be the case that we actually want the list to be more dynamic
  // than it is currently
  propTypes: {
    tagName: React.PropTypes.string,
    id: React.PropTypes.string,
    left: React.PropTypes.number,
    top: React.PropTypes.number,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    text: React.PropTypes.string,
    handleChange: React.PropTypes.func,
    onDone: React.PropTypes.func,
    onDelete: React.PropTypes.func
  },

  render: function() {
    if (this.props.tagName) {
      return (
        <div>
          <table>
            <tr>
              <th>name</th>
              <th>value</th>
            </tr>
            <PropertyRow
              desc={'id'}
              initialValue={this.props['id']}
              handleChange={this.props.handleChange.bind(this, 'id')} />
            <PropertyRow
              desc={'x position (px)'}
              initialValue={this.props['left']}
              handleChange={this.props.handleChange.bind(this, 'left')} />
            <PropertyRow
              desc={'y position (px)'}
              initialValue={this.props['top']}
              handleChange={this.props.handleChange.bind(this, 'top')} />
            <PropertyRow
              desc={'width (px)'}
              initialValue={this.props['width']}
              handleChange={this.props.handleChange.bind(this, 'width')} />
            <PropertyRow
              desc={'height (px)'}
              initialValue={this.props['height']}
              handleChange={this.props.handleChange.bind(this, 'height')} />
            <PropertyRow
              desc={'text'}
              initialValue={this.props['text']}
              handleChange={this.props.handleChange.bind(this, 'text')} />
          </table>
          <button
            id="donePropertiesButton"
            onClick={this.props.onDone}>
            Done
          </button>
          <button
            id="deletePropertiesButton"
            onClick={this.props.onDelete}>
            Delete
          </button>
        </div>
      );
    } else {
      return <p>Click on an element to edit its properties.</p>;
    }
  }
});
