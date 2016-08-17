/** @file Centered animated Modulo Clock component for the Crypto widget levels */
import _ from 'lodash';
import React from 'react';
import color from '../color';

const style = {
  root: {
    textAlign: 'center',
    marginTop: 30
  },
  svg: {
    width: 300,
    height: 300
  },
  face: {
    fill: color.teal
  }
};

const ModuloClock = React.createClass({
  propTypes: {
    modulus: React.PropTypes.number
  },

  render() {
    const {modulus} = this.props;
    return (
      <div style={style.root}>
        <svg viewBox="0 0 100 100" style={style.svg}>
          <circle cx="50" cy="50" r="50" fill={color.lightest_teal}/>
          {_.range(0, modulus).map(n => (
            <line
              key={n}
              x1="50"
              y1="20"
              x2="50"
              y2="5"
              transform={`rotate(${n * 360 / modulus} 50 50)`}
              stroke={color.light_teal}
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>);
  }
});
export default ModuloClock;
