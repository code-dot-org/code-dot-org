import Radium from 'radium';
import commonStyles from '../commonStyles';
import color from '../color';
import applabConstants from './constants';
import experiments from '../experiments';
import ScreenSelector from './ScreenSelector';

const RADIUS = 30;
const FRAME_HEIGHT = 50;

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
    let hideFrame = !showFrame;
    if (!experiments.isEnabled('phoneFrame')) {
      hideFrame = true;
    }

    return (
      <span>
        <div
            style={[
              styles.phoneFrame,
              styles.phoneFrameTop,
              isDark && styles.phoneFrameDark,
              hideFrame && commonStyles.hidden
            ]}
        >
          <div style={styles.screenSelector}>
            {showSelector && <ScreenSelector
                screenIds={this.props.screenIds}
                onCreate={this.props.onScreenCreate}/>
            }
            </div>
        </div>
        {this.props.children}
        <div
            style={[
              styles.phoneFrame,
              styles.phoneFrameBottom,
              isDark && styles.phoneFrameDark,
              hideFrame && commonStyles.hidden
            ]}
        />
      </span>
    );
  }
});

export default Radium(PhoneFrame);
