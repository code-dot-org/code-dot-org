import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import CollapserButton from './CollapserButton';
import ScrollButtons from './ScrollButtons';
import commonStyles from '../../commonStyles';

// Minecraft-specific styles
const craftStyles = {
  scrollButtons: {
    left: 38
  },
  scrollButtonsRtl: {
    right: 38
  },
  collapserButton: {
    padding: 5,
    marginBottom: 0
  }
};

const styles = {
  scrollButtons: {
    position: 'relative',
    top: 50,
    left: 25
  },
  scrollButtonsRtl: {
    position: 'relative',
    top: 50,
    right: 25
  },
  collapserButton: {
    position: 'absolute',
    right: 0,
    marginTop: 5,
    marginRight: 5
  }
};

class CSFInstructionsColumnThree extends React.Component {
  static propTypes = {
    shouldDisplayCollapserButton: PropTypes.func,
    handleClickCollapser: PropTypes.func,
    instructions: PropTypes.func, //maybe rename
    collapser: PropTypes.func, //maybe rename
    scrollButtons: PropTypes.func, //maybe rename
    displayScrollButtons: PropTypes.bool,
    resizerHeight: PropTypes.number,

    //redux
    isMinecraft: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    collapsed: PropTypes.bool.isRequired
  };

  /**
   * @return {Element} scrollTarget
   */
  getScrollTarget = () => {
    return this.props.instructions.parentElement;
  };

  render() {
    return (
      <div>
        <CollapserButton
          ref={this.props.collapser}
          style={[
            styles.collapserButton,
            this.props.isMinecraft && craftStyles.collapserButton,
            !this.props.shouldDisplayCollapserButton() && commonStyles.hidden
          ]}
          collapsed={this.props.collapsed}
          onClick={this.handleClickCollapser}
        />
        {!this.props.collapsed && (
          <ScrollButtons
            style={[
              this.props.isRtl ? styles.scrollButtonsRtl : styles.scrollButtons,
              this.props.isMinecraft &&
                (this.props.isRtl
                  ? craftStyles.scrollButtonsRtl
                  : craftStyles.scrollButtons)
            ]}
            ref={this.props.scrollButtons}
            getScrollTarget={this.getScrollTarget}
            visible={this.props.displayScrollButtons}
            height={
              this.props.height -
              styles.scrollButtons.top -
              this.props.resizerHeight
            }
          />
        )}
      </div>
    );
  }
}

export default connect(state => ({
  isMinecraft: !!state.pageConstants.isMinecraft,
  isRtl: state.isRtl,
  height: state.instructions.renderedHeight,
  collapsed: state.instructions.collapsed
}))(CSFInstructionsColumnThree);
