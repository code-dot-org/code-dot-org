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
  phoneFrameRunning: {
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
    isRunning: React.PropTypes.bool.isRequired
  },

  render: function () {
    const { showFrame, isRunning} = this.props;
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
              isRunning && styles.phoneFrameRunning,
              hideFrame && commonStyles.hidden
            ]}
        />
        {this.props.children}
        <div
            style={[
              styles.phoneFrame,
              styles.phoneFrameBottom,
              isRunning && styles.phoneFrameRunning,
              hideFrame && commonStyles.hidden
            ]}
        />
      </span>
    );
  }
});

export default Radium(PhoneFrame);
