import Radium from 'radium';
import commonStyles from '../commonStyles';
import color from '../color';
import applabConstants from './constants';
import experiments from '../experiments';
import ScreenSelector from './ScreenSelector';
import GameButtons, { RunButton, ResetButton } from '../templates/GameButtons';
import CompletionButton from './CompletionButton';

const RADIUS = 30;
const FRAME_HEIGHT = 60;

const styles = {
  phoneFrame: {
    display: 'block',
    height: FRAME_HEIGHT,
    backgroundColor: color.lighter_gray,
  },
  phoneFrameDark: {
    backgroundColor: color.charcoal
  },
  phoneFrameTop: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },
  phoneFrameBottom: {
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
  },
  nonResponsive: {
    maxWidth: applabConstants.APP_WIDTH,
  },
  screenSelector: {
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: (FRAME_HEIGHT - ScreenSelector.styles.dropdown.height) / 2,
    width: '80%'
  },
  buttonContainer: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: FRAME_HEIGHT
  },
  // The way that this works in the non-phone frame world is use media queries to
  // set runButton's min-width to be 111px at >1051, and 45px otherwise. When
  // min-width was 45px, we would actually render at 105px.
  // In phone frame, there's no reason to resize based on screen width since we
  // don't need to make room for more buttons on the same row. I've decided the
  // 105px looks better than 11px so I'm going with that.
  buttonMinWidth: {
    minWidth: 105
  }
};


const PhoneFrame = React.createClass({
  propTypes: {
    showFrame: React.PropTypes.bool.isRequired,
    isDark: React.PropTypes.bool.isRequired,
    screenIds: React.PropTypes.array.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,
  },

  render: function () {
    const { showFrame, isDark, showSelector } = this.props;
    return (
      <span>
        <div
            style={[
              styles.phoneFrame,
              styles.phoneFrameTop,
              isDark && styles.phoneFrameDark,
              !showFrame && commonStyles.hidden
            ]}
        >
          <div style={styles.screenSelector}>
            {showSelector &&
            <ScreenSelector
                screenIds={this.props.screenIds}
                onCreate={this.props.onScreenCreate}
            />
            }
            </div>
        </div>
        {this.props.children}
        <div
            style={[
              styles.phoneFrame,
              styles.phoneFrameBottom,
              isDark && styles.phoneFrameDark,
              !showFrame && commonStyles.hidden
            ]}
        >
          {showFrame &&
            <div style={styles.buttonContainer}>
              <RunButton hidden={false} style={styles.buttonMinWidth}/>
              <ResetButton style={styles.buttonMinWidth}/>
            </div>
          }
        </div>
      </span>
    );
  }
});

export default Radium(PhoneFrame);
