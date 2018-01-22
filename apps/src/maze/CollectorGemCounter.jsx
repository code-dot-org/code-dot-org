import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import color from '../util/color';
import msg from './locale';

import assetUrl from '@cdo/apps/code-studio/assetUrl';

const styles = {
  container: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r"',
    paddingRight: 10,
    pointerEvents: 'none',
    textAlign: 'right',
    verticalAlign: 'top',
    marginTop: 5,
  },
  label: {
    color: color.white,
    textTransform: 'capitalize',
    backgroundColor: color.charcoal,
    textAlign: 'center',
    fontSize: 14,
    borderRadius: 2,
    width: '100%',
  },
  hr: {
    borderColor: color.lighter_gray,
    borderWidth: 2,
    margin: '0 auto',
  },
  gemImage: {
    backgroundImage: `url("${assetUrl('media/skins/collector/gem.png')}")`,
    backgroundSize: '120%',
    backgroundPosition: 'center',
    display: 'inline',
    padding: 5
  },
  checkmark: {
    color: 'lightgreen',
    fontSize: 18,
    left: 5,
    lineHeight: '25px',
    position: 'relative',
    top: 7,
  },
  gemCount: {
    paddingRight: 5,
    fontSize: 17,
    color: color.charcoal,
  },
};

export class CollectorGemCounter extends React.Component {
  static propTypes = {
    currentCollected: PropTypes.number.isRequired,
    minRequired: PropTypes.number,
  };

  static defaultProps = {
    minRequired: 1,
  };

  render() {
    const showCheckmark = this.props.currentCollected >= this.props.minRequired;

    return (
      <div style={styles.container}>
        <div style={styles.label}>{msg.goal()}</div>
        <div style={styles.gemImage} >
          <i
            style={{
              ...styles.checkmark,
              visibility: showCheckmark ? 'visible' : 'hidden',
            }}
            className="fa fa-check"
            aria-hidden="true"
          />
        </div>
        <span style={styles.gemCount}>
          {this.props.currentCollected}/{this.props.minRequired}
        </span>
      </div>
    );
  }
}

export default connect(state => ({
  currentCollected: state.maze.collectorCurrentCollected,
  minRequired: state.maze.collectorMinRequired,
}))(CollectorGemCounter);
