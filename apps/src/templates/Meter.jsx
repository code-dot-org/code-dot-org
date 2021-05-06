import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

export default class Meter extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    containerStyle: PropTypes.object
  };

  render() {
    const {id, label, value, max, containerStyle} = this.props;
    const percentFull = Math.round((value / max) * 100);

    let backgroundColor = color.light_teal;
    if (percentFull >= 90) {
      backgroundColor = color.red;
    } else if (percentFull >= 75) {
      backgroundColor = color.orange;
    }

    return (
      <div style={{...styles.container, ...containerStyle}}>
        {label && (
          <label htmlFor={id} style={styles.label}>
            {label}
          </label>
        )}
        <div id={id} style={styles.meter}>
          <div
            style={{
              ...styles.meterValue,
              width: `${percentFull}%`,
              backgroundColor
            }}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    margin: '0 10px'
  },
  meter: {
    width: 100,
    height: 10,
    borderRadius: 8,
    backgroundColor: color.white,
    overflow: 'hidden'
  },
  meterValue: {
    height: '100%'
  }
};
