/* global $ */

var color = require('../color');
var DesignToolbox = require('./DesignToolbox.jsx');
var DesignProperties = require('./designProperties.jsx');

module.exports = React.createClass({
  propTypes: {
    handleDragStart: React.PropTypes.func,
    element: React.PropTypes.instanceOf(HTMLElement),
    elementIdList: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onChangeElement: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired,
    isDimmed: React.PropTypes.bool.isRequired
  },

  render: function() {
    var styles = {
      container: {
        position: 'absolute',
        width: '100%',
        top: 30,
        bottom: 0,
        backgroundColor: color.white,
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
      },
      transparent: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }
    };

    var transparencyLayer;
    // Slightly gray everything while running
    if (this.props.isDimmed) {
      transparencyLayer = (
        <div id={"design-mode-dimmed"} style={styles.transparent}/>
      );
    }

    return (
      <div id="design-mode-container" style={styles.container}>
        <DesignToolbox
            handleDragStart={this.props.handleDragStart}
            isToolboxVisible={this.props.isToolboxVisible}/>
        <div id="design-properties" style={styles.designProperties}>
          <DesignProperties
            element={this.props.element}
            elementIdList={this.props.elementIdList}
            handleChange={this.props.handleChange}
            onChangeElement={this.props.onChangeElement}
            onDepthChange={this.props.onDepthChange}
            onDelete={this.props.onDelete}
            onInsertEvent={this.props.onInsertEvent}/>
        </div>
        {transparencyLayer}
      </div>
    );
  }
});
