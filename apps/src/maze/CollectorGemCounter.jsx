import React from 'react';
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
  },
  label: {
    color: color.lighter_gray,
    textTransform: 'capitalize'
  },
  hr: {
    borderColor: color.lighter_gray,
    borderWidth: 2,
    margin: '0 auto',
  },
  gemImage: {
    backgroundImage: `url("${assetUrl('media/skins/collector/gem.png')}")`,
    backgroundSize: '100%',
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
};

export class CollectorGemCounter extends React.Component {
  static propTypes = {
    currentCollected: React.PropTypes.number.isRequired,
    minRequired: React.PropTypes.number,
  }

  static defaultProps = {
    minRequired: 1,
  }

  render() {
    const showCheckmark = this.props.currentCollected >= this.props.minRequired;

    return (
      <div style={styles.container}>
        <div>
          <span style={styles.label}>{msg.goal()}</span>
          <hr style={styles.hr} />
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
          <span>{this.props.currentCollected}/{this.props.minRequired}</span>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  currentCollected: state.maze.collectorCurrentCollected,
  minRequired: state.maze.collectorMinRequired,
}))(CollectorGemCounter);
