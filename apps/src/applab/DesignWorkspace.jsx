import React from 'react';
import DesignModeBox from './DesignModeBox';
import DesignModeHeaders from './DesignModeHeaders';
import {connect} from 'react-redux';

const DesignWorkspace = React.createClass({
  propTypes: {
    handleManageAssets: React.PropTypes.func.isRequired,
    handleVersionHistory: React.PropTypes.func.isRequired,
    handleDragStart: React.PropTypes.func,
    element: React.PropTypes.instanceOf(HTMLElement),
    elementIdList: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onChangeElement: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDuplicate: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired,
    isDimmed: React.PropTypes.bool.isRequired,

    // provided by redux
    isRunning: React.PropTypes.bool.isRequired,
    localeDirection: React.PropTypes.oneOf(['rtl', 'ltr']).isRequired,
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
    return (<div id="designWorkspaceWrapper">
      <DesignModeHeaders
        handleManageAssets={this.props.handleManageAssets}
        handleVersionHistory={this.props.handleVersionHistory}
        onToggleToolbox={this.onToggleToolbox}
        isToolboxVisible={this.state.isToolboxVisible}
        localeDirection={this.props.localeDirection}
        isRunning={this.props.isRunning}
      />
      <DesignModeBox
        handleDragStart={this.props.handleDragStart}
        element={this.props.element}
        elementIdList={this.props.elementIdList}
        handleChange={this.props.handleChange}
        onChangeElement={this.props.onChangeElement}
        onDepthChange={this.props.onDepthChange}
        onDuplicate={this.props.onDuplicate}
        onDelete={this.props.onDelete}
        onInsertEvent={this.props.onInsertEvent}
        isToolboxVisible={this.state.isToolboxVisible}
        isDimmed={this.props.isDimmed}
      />
    </div>);
  }
});
export default connect(state => ({
  localeDirection: state.pageConstants.localeDirection,
  isRunning: !!state.runState.isRunning,
}))(DesignWorkspace);
