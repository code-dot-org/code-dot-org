import Radium from 'radium';
import commonStyles from '../commonStyles';
import color from '../color';
import applabConstants from './constants';
import experiments from '../experiments';

const RADIUS = 30;

const styles = {
  phoneFrame: {
    display: 'block',
    height: 50,
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
  }
};


const PhoneFrame = React.createClass({
  propTypes: {
    showFrame: React.PropTypes.bool.isRequired,
    isDark: React.PropTypes.bool.isRequired
  },

  render: function () {
    const { showFrame, isDark } = this.props;
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
        />
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
