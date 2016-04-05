var applabMsg = require('./locale');
var DesignModeBox = require('./DesignModeBox.jsx');
var DesignModeHeaders = require('./DesignModeHeaders.jsx');

module.exports = React.createClass({
  propTypes: {
    handleManageAssets: React.PropTypes.func.isRequired,
    handleDragStart: React.PropTypes.func,
    element: React.PropTypes.instanceOf(HTMLElement),
    elementIdList: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onChangeElement: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired,
    isDimmed: React.PropTypes.bool.isRequired
  },

  getInitialState: function () {
    return {
      isToolboxVisible: true
    };
  },

  onToggleToolbox: function () {
    this.setState({
      isToolboxVisible: !this.state.isToolboxVisible
    });
  },

  render: function () {
    return <div id="designWorkspaceWrapper">
      <DesignModeHeaders
        handleManageAssets={this.props.handleManageAssets}
        onToggleToolbox={this.onToggleToolbox}
        isToolboxVisible={this.state.isToolboxVisible} />
      <DesignModeBox
        handleDragStart={this.props.handleDragStart}
        element={this.props.element}
        elementIdList={this.props.elementIdList}
        handleChange={this.props.handleChange}
        onChangeElement={this.props.onChangeElement}
        onDepthChange={this.props.onDepthChange}
        onDelete={this.props.onDelete}
        onInsertEvent={this.props.onInsertEvent}
        isToolboxVisible={this.state.isToolboxVisible}
        isDimmed={this.props.isDimmed} />
    </div>;
  }
});
