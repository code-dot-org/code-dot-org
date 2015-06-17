/* global $ */

var React = require('react');
var DesignToolbox = require('./designToolbox.jsx');
var DesignProperties = require('./designProperties.jsx');

module.exports = React.createClass({
  propTypes: {
    handleDragStart: React.PropTypes.func,
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired,
  },

  render: function() {
    var styles = {
      container: {
        position: 'absolute',
        width: '100%',
        top: 30,
        bottom: 0,
        backgroundColor: 'white',
        boxSizing: 'border-box',
        borderLeft: '1px solid gray',
        borderRight: '1px solid gray',
        borderBottom: '1px solid gray'
      },
      designProperties: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: this.props.isToolboxVisible ? 270 : 0,
        right: 0,
        boxSizing: 'border-box',
        padding: 10
      }
    };

    return (
      <div id="design-mode-container" style={styles.container}>
        <DesignToolbox
            handleDragStart={this.props.handleDragStart}
            isToolboxVisible={this.props.isToolboxVisible}/>
        <div id="design-properties" style={styles.designProperties}>
          <DesignProperties
            element={this.props.element}
            handleChange={this.props.handleChange}
            onDepthChange={this.props.onDepthChange}
            onDelete={this.props.onDelete} />
        </div>
      </div>
    );
  }
});
