import PropTypes from 'prop-types';
import React, {Component} from 'react';

import msg from '@cdo/locale';

import project from '../code-studio/initApp/project';
import UserPreferences from '../lib/util/UserPreferences';
import logToCloud from '../logToCloud';
import {singleton as studioApp} from '../StudioApp';

import {PaneButton} from './PaneHeader';

const commonProps = {
  hasFocus: PropTypes.bool,
  isRtl: PropTypes.bool,
  isMinecraft: PropTypes.bool,
};

class ShowCodeButton extends Component {
  static propTypes = {
    ...commonProps,
    onClick: PropTypes.func,

    hidden: PropTypes.bool,
    showingBlocks: PropTypes.bool,
    showCodeLabel: PropTypes.string,
    showBlocksLabel: PropTypes.string,
  };

  static defaultProps = {
    showBlocksLabel: msg.showBlocksHeader(),
    showCodeLabel: msg.showCodeHeader(),
  };

  onClick() {
    this.props.onClick();
  }

  render() {
    return (
      <PaneButton
        id="show-code-header"
        iconProps={{
          iconName: this.props.showingBlocks
            ? 'code'
            : 'chart-simple-horizontal',
          iconStyle: 'solid',
        }}
        label={
          this.props.showingBlocks
            ? this.props.showCodeLabel
            : this.props.showBlocksLabel
        }
        isRtl={!!this.props.isRtl}
        isMinecraft={!!this.props.isMinecraft}
        headerHasFocus={!!this.props.hasFocus}
        onClick={this.onClick.bind(this)}
        style={this.props.hidden ? {display: 'none'} : undefined}
      />
    );
  }
}

class DropletCodeToggle extends Component {
  static propTypes = {
    ...commonProps,
    onToggle: PropTypes.func.isRequired,
  };

  afterInit = () => {
    this.forceUpdate();
  };

  UNSAFE_componentWillMount() {
    studioApp().on('afterInit', this.afterInit);
  }

  componentWillUnmount() {
    studioApp().removeListener('afterInit', this.afterInit);
  }

  toggle = () => {
    // are we trying to toggle from blocks to text (or the opposite)
    let fromBlocks = studioApp().currentlyUsingBlocks();

    let result;
    try {
      result = studioApp().editor.toggleBlocks();
    } catch (err) {
      result = {error: err, nonDropletError: true};
    }
    if (result && result.error) {
      logToCloud.addPageAction(logToCloud.PageAction.DropletTransitionError, {
        dropletError: !result.nonDropletError,
        fromBlocks,
      });
      studioApp().showToggleBlocksError();
    } else {
      studioApp().onDropletToggle();
      this.forceUpdate();
      this.props.onToggle(studioApp().currentlyUsingBlocks());
    }
  };

  onClick = () => {
    this.toggle();
    new UserPreferences().setUsingTextMode(
      !studioApp().currentlyUsingBlocks(),
      {
        project_id: project.getCurrentId(),
        level_id: studioApp().config.level.id,
      }
    );
  };

  render() {
    return (
      <ShowCodeButton
        hasFocus={this.props.hasFocus}
        isRtl={this.props.isRtl}
        isMinecraft={this.props.isMinecraft}
        onClick={this.onClick}
        hidden={!studioApp().enableShowCode}
        showingBlocks={studioApp().currentlyUsingBlocks()}
        showCodeLabel={msg.showTextHeader()}
      />
    );
  }
}

class BlocklyShowCodeButton extends Component {
  static propTypes = {
    ...commonProps,
    onToggle: PropTypes.func.isRequired,
  };

  onClick = () => {
    studioApp().showGeneratedCode();
    this.props.onToggle(true);
  };

  render() {
    return (
      <ShowCodeButton
        hasFocus={this.props.hasFocus}
        isRtl={this.props.isRtl}
        isMinecraft={this.props.isMinecraft}
        onClick={this.onClick}
        hidden={!studioApp().enableShowCode}
        showingBlocks
      />
    );
  }
}

export default class ShowCodeToggle extends Component {
  static propTypes = {
    ...commonProps,
    onToggle: PropTypes.func.isRequired,
  };

  afterInit = () => {
    this.forceUpdate();
  };

  UNSAFE_componentWillMount() {
    studioApp().on('afterInit', this.afterInit);
  }

  render() {
    return studioApp().editCode ? (
      <DropletCodeToggle {...this.props} />
    ) : (
      <BlocklyShowCodeButton {...this.props} />
    );
  }
}
