/** @file Centered animated Modulo Clock component for the Crypto widget levels */
import _ from 'lodash';
import React from 'react';
import color from '../color';

// Defines the coordinate scale for SVG elements
const VIEWBOX_SIDE = 100;
// Above this size, the slices of the clock will have less space between them
const SMALL_GAPS_OVER_MODULUS = 200;
// Above this size, the clock will not render individual slices
const CONTINUOUS_METER_OVER_MODULUS = 400;
// Radius of the outer edge of a wedge clock segment
const WEDGE_OUTER_RADIUS = 48;
// Radius of the inner edge of a wedge clock segment
const WEDGE_INNER_RADIUS = 25;

const COLOR = {
  clockFace: color.lightest_teal,
  emptyWedge: color.white,
  fullWedge: color.teal,
};

const style = {
  root: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 30
  },
  svg: {
    width: 300,
    height: 300
  }
};

const ModuloClock = React.createClass({
  propTypes: {
    dividend: React.PropTypes.number,
    modulus: React.PropTypes.number
  },

  renderSegments() {
    const {dividend, modulus} = this.props;
    const segmentGapInDegrees = modulus > SMALL_GAPS_OVER_MODULUS ? 0.5 : 1;
    const segmentGapRadians = segmentGapInDegrees * 2 * Math.PI / 360;
    const result = dividend % modulus;

    if (modulus > CONTINUOUS_METER_OVER_MODULUS) {
      // Render a continuous meter
      const fullCircle = 2 * Math.PI - segmentGapRadians;
      const emptyPath = createWedgePath(fullCircle);
      const fullPath = createWedgePath(fullCircle * result / modulus);
      return [
        <path
          key="emptyPart"
          d={emptyPath}
          fill={COLOR.emptyWedge}
        />,
        <path
          key="fullPart"
          d={fullPath}
          fill={COLOR.fullWedge}
        />
      ];
    } else {
      // Render distinct segments
      const wedgePath = createWedgePath((2 * Math.PI / modulus) - segmentGapRadians);
      return _.range(0, modulus).map(n => (
        <path
          key={n}
          d={wedgePath}
          transform={`rotate(${(n - 0.5) * 360 / modulus} 50 50)`}
          fill={n <= result ? COLOR.fullWedge : COLOR.emptyWedge}
        />
      ));
    }
  },

  render() {
    return (
      <div style={style.root}>
        <svg viewBox={`0 0 ${VIEWBOX_SIDE} ${VIEWBOX_SIDE}`} style={style.svg}>
          <circle cx={VIEWBOX_SIDE / 2} cy={VIEWBOX_SIDE / 2} r={VIEWBOX_SIDE / 2} fill={COLOR.clockFace}/>
          {this.renderSegments()}
        </svg>
      </div>);
  }
});
export default ModuloClock;

/**
 * Produces SVG Path string for a clock segment sweeping the given number of
 * degrees, with its left edge aligned to 12o'clock.
 * Most other clock properties are hard-coded.
 * @param {!number} arcRadians
 *
 */
function createWedgePath(arcRadians) {
  const t = arcRadians;
  const r1 = WEDGE_OUTER_RADIUS;
  const r2 = WEDGE_INNER_RADIUS;
  const x1 = VIEWBOX_SIDE / 2;
  const y1 = (VIEWBOX_SIDE / 2) - r1;
  const y2 = (VIEWBOX_SIDE / 2) - r2;
  const largeArc = arcRadians > Math.PI ? 1 : 0;
  return `
      M ${x1} ${y1}
      A ${r1} ${r1}, 0, ${largeArc}, 1, ${x1 + r1 * Math.sin(t)} ${y1 + r1 * (1 - Math.cos(t))}
      L ${x1 + r2 * Math.sin(t)} ${y2 + r2 * (1 - Math.cos(t))}    
      A ${r2} ${r2}, 0, ${largeArc}, 0, ${x1} ${y2}
      Z`;
}
