import React, {PropTypes} from 'react';
import color from "../util/color";
import DesignToolbox from './DesignToolbox';
import DesignProperties from './designProperties';

export default class DesignModeBox extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement),
    elementIdList: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleChange: PropTypes.func.isRequired,
    handleDragStart: PropTypes.func,
    isDimmed: PropTypes.bool.isRequired,
    isToolboxVisible: PropTypes.bool.isRequired,
    onCopyElementToScreen: PropTypes.func.isRequired,
    onChangeElement: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
    screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  render() {
    const styles = {
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

    let transparencyLayer;
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
          isToolboxVisible={this.props.isToolboxVisible}
        />
        <div id="design-properties" style={styles.designProperties}>
          <DesignProperties
            element={this.props.element}
            elementIdList={this.props.elementIdList}
            handleChange={this.props.handleChange}
            onCopyElementToScreen={this.props.onCopyElementToScreen}
            onChangeElement={this.props.onChangeElement}
            onDepthChange={this.props.onDepthChange}
            onDuplicate={this.props.onDuplicate}
            onDelete={this.props.onDelete}
            onInsertEvent={this.props.onInsertEvent}
            screenIds={this.props.screenIds}
          />
        </div>
        {transparencyLayer}
      </div>
    );
  }
}
