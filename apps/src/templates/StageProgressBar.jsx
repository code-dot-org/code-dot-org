import locale from '@cdo/locale';
import React, {PropTypes} from 'react';

const MIN_PROGRESS_WIDTH = 22;
const MAX_PROGRESS_WIDTH = 400;

const styles = {
  stageRewards: {
    position: 'absolute',
    background: '#f3eeff',
    top: 240,
    left: 100,
    width: '500px',
    height: '75px',
    border: '1px solid #d2cae6',
    borderRadius: 3,
  },
  stageRewardsTitle: {
    textAlign: 'center',
    color: '#655689',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
  },
  progressBackground: {
    position: 'absolute',
    background: '#fff',
    borderRadius: 10,
    border: '1px solid #d2cae6',
    height: 20,
    width: MAX_PROGRESS_WIDTH,
    left: 50,
  },
  progressForeground: {
    position: 'absolute',
    background: '#eaa721',
    borderRadius: 11,
    height: 22,
    top: -1,
    left: -1,
  },
};

const StageProgressBar = React.createClass({
  propTypes: {
    stageProgress: PropTypes.number,
  },

  progressToBarWidth(progress) {
    return MIN_PROGRESS_WIDTH +
      progress * (MAX_PROGRESS_WIDTH - MIN_PROGRESS_WIDTH);
  },

  render() {
    return (
      <div style={styles.stageRewards}>
        <div style={styles.stageRewardsTitle}>
          {locale.stageRewards()}
        </div>
        <div style={styles.progressBackground}>
          <div
            style={{
              ...styles.progressForeground,
              width: this.progressToBarWidth(this.props.stageProgress),
            }}
          />
        </div>
      </div>
    );
  },
});

export default StageProgressBar;
