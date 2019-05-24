import React from 'react';
import PropTypes from 'prop-types';
import color from '../../util/color';
import {connect} from 'react-redux';
import ContainedLevel from '../ContainedLevel';
import InlineAudio from './InlineAudio';

const CONTAINED_LEVEL_PADDING = 10;

const containedLevelStyles = {
  background: {
    backgroundColor: color.background_gray,
    overflowY: 'scroll'
  },
  level: {
    paddingTop: CONTAINED_LEVEL_PADDING,
    paddingLeft: CONTAINED_LEVEL_PADDING,
    paddingRight: CONTAINED_LEVEL_PADDING
  },
  audioControls: {
    paddingTop: 10
  }
};

const audioStyle = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    border: '2px solid ' + color.lighter_gray,
    borderRadius: '4px'
  },
  button: {
    height: '32px',
    backgroundColor: '#FFFFFF'
  },
  buttonImg: {
    lineHeight: '32px',
    fontSize: 20
  }
};

class CSFContainedLevelInstructions extends React.Component {
  static propTypes = {
    topInstructionsHeight: PropTypes.number,
    showAudioControls: PropTypes.bool,
    containedLevel: PropTypes.func, //maybe rename

    //Redux
    ttsLongInstructionsUrl: PropTypes.string
  };

  render() {
    const {
      topInstructionsHeight,
      showAudioControls,
      containedLevel,
      ttsLongInstructionsUrl
    } = this.props;

    return (
      <div
        style={{
          ...containedLevelStyles.background,
          height: topInstructionsHeight,
          display: 'flex',
          justifyContent: 'space-around'
        }}
      >
        <div style={containedLevelStyles.level} className="contained-level">
          <ContainedLevel ref={containedLevel} />
        </div>
        {showAudioControls && (
          <div style={containedLevelStyles.audioControls}>
            <InlineAudio src={ttsLongInstructionsUrl} style={audioStyle} />
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  ttsLongInstructionsUrl: state.pageConstants.ttsLongInstructionsUrl
}))(CSFContainedLevelInstructions);
