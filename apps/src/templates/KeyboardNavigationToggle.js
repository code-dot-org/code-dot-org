import PropTypes from 'prop-types';
import React, {Component} from 'react';
import trackEvent from '../util/trackEvent';
import {singleton as studioApp} from '../StudioApp';
import {PaneButton} from './PaneHeader';
import msg from '@cdo/locale';

const commonProps = {
  hasFocus: PropTypes.bool,
  isRtl: PropTypes.bool,
  isMinecraft: PropTypes.bool,
};

class KeyboardNavigationToggle extends Component {
  static propTypes = commonProps;

  onClick = () => {
    const controller = Blockly.navigationController;
    const workspace = Blockly.common.getMainWorkspace();
    workspace.keyboardAccessibilityMode
      ? controller.disable(workspace)
      : controller.enable(workspace);
    document.activeElement.blur();
    trackEvent('keyboardNavigation', 'click', 'header');
  };

  afterInit = () => {
    this.forceUpdate();
  };

  componentDidMount() {
    studioApp().on('afterInit', this.afterInit);
  }

  componentWillUnmount() {
    studioApp().removeListener('afterInit', this.afterInit);
  }

  render() {
    const hidden = Blockly.version !== 'Google';
    return (
      <PaneButton
        id="keyboard-navigation-header"
        iconClass="fa fa-keyboard"
        label={msg.blocklyKBNav()}
        isRtl={!!this.props.isRtl}
        isMinecraft={!!this.props.isMinecraft}
        headerHasFocus={!!this.props.hasFocus}
        onClick={this.onClick}
        style={hidden ? {display: 'none'} : {display: 'inline-block'}}
      />
    );
  }
}

export default KeyboardNavigationToggle;
