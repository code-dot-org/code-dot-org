import React, {PropTypes} from 'react';
import DesignModeBox from './DesignModeBox';
import DesignModeHeaders from './DesignModeHeaders';
import {connect} from 'react-redux';

class DesignWorkspace extends React.Component {
  static propTypes = {
    handleVersionHistory: PropTypes.func.isRequired,
    handleDragStart: PropTypes.func,
    element: PropTypes.instanceOf(HTMLElement),
    elementIdList: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleChange: PropTypes.func.isRequired,
    onChangeElement: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
    isDimmed: PropTypes.bool.isRequired,

    // provided by redux
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    showMakerToggle: PropTypes.bool,
  };

  state ={isToolboxVisible: true};

  onToggleToolbox = () => this.setState({
    isToolboxVisible: !this.state.isToolboxVisible
  });

  render() {
    return (<div id="designWorkspaceWrapper">
      <DesignModeHeaders
        handleVersionHistory={this.props.handleVersionHistory}
        onToggleToolbox={this.onToggleToolbox}
        isToolboxVisible={this.state.isToolboxVisible}
        showProjectTemplateWorkspaceIcon={this.props.showProjectTemplateWorkspaceIcon}
        isRtl={this.props.isRtl}
        isRunning={this.props.isRunning}
        showMakerToggle={this.props.showMakerToggle}
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
}
export default connect(state => ({
  showProjectTemplateWorkspaceIcon: !!state.pageConstants.showProjectTemplateWorkspaceIcon,
  isRtl: state.isRtl,
  isRunning: !!state.runState.isRunning,
  showMakerToggle: !!state.pageConstants.showMakerToggle,
}))(DesignWorkspace);
