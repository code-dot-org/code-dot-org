import {Motion, spring} from 'react-motion';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

export default class Odometer extends Component {
  static propTypes = {
    defaultValue: PropTypes.number,
    value: PropTypes.number.isRequired,
    onRest: PropTypes.func
  };

  render() {
    const digits = [];
    for (let i = 1; i === 1 || i <= this.props.value; i *= 10) {
      const placeValue = Math.floor(this.props.value / i);
      const defaultPlaceValue = Math.floor(this.props.defaultValue / i);
      digits.push(
        <Motion
          defaultStyle={{value: defaultPlaceValue || 0}}
          style={{value: spring(placeValue, {stiffness: 150, damping: 25})}}
          onRest={i === 1 ? this.props.onRest : undefined}
          key={i}
        >
          {interpolatingStyle => (
            <OdometerDigit value={interpolatingStyle.value} />
          )}
        </Motion>
      );
    }
    digits.reverse();
    return <span>{digits}</span>;
  }
}

class OdometerDigit extends Component {
  static propTypes = {
    value: PropTypes.number.isRequired
  };

  render() {
    const digit = Math.floor(this.props.value % 10);
    const progress = (this.props.value % 10) - digit;
    return (
      <span style={styles.slot}>
        <div
          style={{
            ...styles.digit,
            transform: `translateY(-${100 * (1 - progress)}%)`
          }}
        >
          {(digit + 1) % 10}
        </div>
        <div
          style={{
            ...styles.digit,
            transform: `translateY(-${100 * (1 - progress)}%)`
          }}
        >
          {digit}
        </div>
      </span>
    );
  }
}

const styles = {
  slot: {
    height: 36,
    display: 'inline-block',
    overflowY: 'hidden'
  },
  digit: {
    paddingTop: 15,
    height: 36,
    width: 21,
    overflowX: 'hidden'
  }
};
