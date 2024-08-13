import PropTypes from 'prop-types';
import React from 'react';

import color from '../util/color';

import DesignProperties from './designProperties';
import DesignToolbox from './DesignToolbox';

export default class DesignModeBox extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement),
    elementIdList: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleChange: PropTypes.func.isRequired,
    handleDragStart: PropTypes.func,
    isDimmed: PropTypes.bool.isRequired,
    isToolboxVisible: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    onCopyElementToScreen: PropTypes.func.isRequired,
    onChangeElement: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onRestoreThemeDefaults: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
    screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    currentTheme: PropTypes.string.isRequired,
    handleScreenChange: PropTypes.func.isRequired,
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
        borderBottom: '1px solid gray',
      },
      designProperties: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: this.props.isToolboxVisible && !this.props.isRtl ? 270 : 0,
        right: this.props.isToolboxVisible && this.props.isRtl ? 270 : 0,
        boxSizing: 'border-box',
        padding: 10,
      },
      transparent: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1,
      },
    };

    let transparencyLayer;
    // Slightly gray everything while running
    if (this.props.isDimmed) {
      transparencyLayer = (
        <div id={'design-mode-dimmed'} style={styles.transparent} />
      );
    }

    return (
      <div id="design-mode-container" style={styles.container}>
        <DesignToolbox
          handleDragStart={this.props.handleDragStart}
          isToolboxVisible={this.props.isToolboxVisible}
          isRtl={this.props.isRtl}
          handleScreenChange={this.props.handleScreenChange}
          themeValue={this.props.currentTheme}
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
            onRestoreThemeDefaults={this.props.onRestoreThemeDefaults}
            onDelete={this.props.onDelete}
            onInsertEvent={this.props.onInsertEvent}
            screenIds={this.props.screenIds}
            isRtl={this.props.isRtl}
          />
        </div>
        {transparencyLayer}
      </div>
    );
  }
}
