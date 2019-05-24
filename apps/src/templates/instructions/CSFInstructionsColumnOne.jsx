import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classNames from 'classnames';
import HintDisplayLightbulb from '../HintDisplayLightbulb';
import PromptIcon from './PromptIcon';
import commonStyles from '../../commonStyles';

const styles = {
  // bubble has pointer cursor by default. override that if no hints
  noAuthoredHints: {
    cursor: 'default',
    marginBottom: 0
  },
  authoredHints: {
    // raise by 20 so that the lightbulb "floats" without causing the original
    // icon to move. This strangeness happens in part because prompt-icon-cell
    // is managed outside of React
    marginBottom: 0
  }
};

class CSFInstructionsColumnOne extends React.Component {
  static propTypes = {
    getAvatar: PropTypes.string,
    handleClickBubble: PropTypes.func,
    icon: PropTypes.func, // maybe rename

    //redux
    hasAuthoredHints: PropTypes.bool
  };

  render() {
    const {getAvatar, hasAuthoredHints, handleClickBubble, icon} = this.props;

    return (
      <div
        style={[
          commonStyles.bubble,
          hasAuthoredHints ? styles.authoredHints : styles.noAuthoredHints
        ]}
      >
        <div
          className={classNames({
            'prompt-icon-cell': true,
            authored_hints: hasAuthoredHints
          })}
          onClick={handleClickBubble}
        >
          {hasAuthoredHints && <HintDisplayLightbulb />}
          {getAvatar && <PromptIcon src={getAvatar} ref={icon} />}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  hasAuthoredHints: state.instructions.hasAuthoredHints
}))(CSFInstructionsColumnOne);
