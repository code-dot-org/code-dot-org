import React, {Component, PropTypes} from 'react';
import logToCloud from '../logToCloud';
import {singleton as studioApp} from '../StudioApp';
import {PaneButton} from './PaneHeader';
import msg from '@cdo/locale';

const BLOCKS_GLYPH_LIGHT = "data:image/gif;base64,R0lGODlhEAAQAIAAAP///////yH+GkNyZWF0ZWQgd2l0aCBHSU1QIG9uIGEgTWFjACH5BAEKAAEALAAAAAAQABAAAAIdjI+py40AowRp2molznBzB3LTIWpGGZEoda7gCxYAOw==";
const BLOCKS_GLYPH_DARK = "data:image/gif;base64,R0lGODlhEAAQAIAAAE1XX01XXyH+GkNyZWF0ZWQgd2l0aCBHSU1QIG9uIGEgTWFjACH5BAEKAAEALAAAAAAQABAAAAIdjI+py40AowRp2molznBzB3LTIWpGGZEoda7gCxYAOw==";

const styles = {
  blocksGlyph: {
    display: 'none',
    height: 18,
    lineHeight: '24px',
    verticalAlign: 'text-bottom',
    paddingRight: 8
  },
  blocksGlyphRtl: {
    paddingRight: 0,
    paddingLeft: 8,
    transform: 'scale(-1, 1)',
    MozTransform: 'scale(-1, 1)',
    WebkitTransform: 'scale(-1, 1)',
    OTransform: 'scale(-1, 1)',
    msTransform: 'scale(-1, 1)',
  },
};

export default class ShowCodeToggle extends Component {
  static propTypes = {
    hasFocus: PropTypes.bool,
    isRtl: PropTypes.bool,
    isMinecraft: PropTypes.bool,
    onToggle: PropTypes.func,
  };

  state = {
    showingBlocks: true,
  };

  afterInit = () => {
    this.forceUpdate();
  };

  componentWillMount() {
    if (studioApp().editor) {
      this.setState({showingBlocks: studioApp().editor.currentlyUsingBlocks});
    }

    studioApp().on('afterInit', this.afterInit);
  }

  componentWillUnmount() {
    studioApp().removeListener('afterInit', this.afterInit);
  }

  onClick = () => {
    if (studioApp().editCode) {
      // are we trying to toggle from blocks to text (or the opposite)
      let fromBlocks = studioApp().editor.currentlyUsingBlocks;

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
        this.setState({showingBlocks: studioApp().editor.currentlyUsingBlocks});
      }
    } else {
      studioApp().showGeneratedCode();
    }

    if (this.props.onToggle) {
      this.props.onToggle(studioApp().editCode ? studioApp().editor.currentlyUsingBlocks : true);
    }
  }

  render() {
    const blocksGlyphImage = (
      <img
        src={this.props.hasFocus ? BLOCKS_GLYPH_LIGHT : BLOCKS_GLYPH_DARK}
        style={[
          styles.blocksGlyph,
          this.props.isRtl && styles.blocksGlyphRtl,
          this.state.showingBlocks ? {display: 'none'} : {display: 'inline-block'},
        ]}
      />
    );
    let label = msg.showCodeHeader();
    if (studioApp().editCode) {
      label = this.state.showingBlocks ? msg.showTextHeader() : msg.showBlocksHeader();
    }
    return (
      <PaneButton
        id="show-code-header"
        hiddenImage={blocksGlyphImage}
        iconClass={this.state.showingBlocks ? "fa fa-code" : ""}
        label={label}
        isRtl={!!this.props.isRtl}
        isMinecraft={!!this.props.isMinecraft}
        headerHasFocus={!!this.props.hasFocus}
        onClick={this.onClick}
        style={studioApp().enableShowCode ? {display: 'inline-block'} : {display: 'none'}}
      />
    );
  }
}
