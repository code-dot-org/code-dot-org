/** @file Centered animated Modulo Clock component for the Crypto widget levels */
import _ from 'lodash';
import React from 'react';
import color from '../color';

const VIEWBOX_SIDE = 100;

const style = {
  root: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 30
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
    dividend: React.PropTypes.number,
    modulus: React.PropTypes.number
  },

  render() {
    const {dividend, modulus} = this.props;
    const result = dividend % modulus;
    const r1 = 48;
    const r2 = 25;
    const x1 = VIEWBOX_SIDE / 2;
    const y1 = (VIEWBOX_SIDE / 2) - r1;
    const y2 = (VIEWBOX_SIDE / 2) - r2;
    const t = (2 * Math.PI / modulus) - (2 * Math.PI / 360);
    const largeArc = modulus > 1 ? 0 : 1;
    const wedgePath = `
        M ${x1} ${y1}
        A ${r1} ${r1}, 0, ${largeArc}, 1, ${x1 + r1 * Math.sin(t)} ${y1 + r1 * (1 - Math.cos(t))}
        L ${x1 + r2 * Math.sin(t)} ${y2 + r2 * (1 - Math.cos(t))}    
        A ${r2} ${r2}, 0, ${largeArc}, 0, ${x1} ${y2}
        Z`;
    return (
      <div style={style.root}>
        <svg viewBox={`0 0 ${VIEWBOX_SIDE} ${VIEWBOX_SIDE}`} style={style.svg}>
          <circle cx="50" cy="50" r="50" fill={color.lightest_teal}/>
          {_.range(0, modulus).map(n => (
            <path
              key={n}
              d={wedgePath}
              transform={`rotate(${(n - 0.5) * 360 / modulus} 50 50)`}
              fill={n <= result ? color.teal : color.white}
            />
          ))}
        </svg>
      </div>);
  }
});
export default ModuloClock;
