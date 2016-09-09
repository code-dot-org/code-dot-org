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
  clockFace: color.lightest_cyan,
  emptyWedge: color.white,
  fullWedge: color.cyan,
  valueText: color.cyan
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
    modulus: React.PropTypes.number
  },

  getInitialState() {
    return {
      currentDividend: 0
    };
  },

  /**
   * @param {number} dividend - The left-hand-side of the modulus operation
   * @param {number} speed - A value from 1 to 10 where 10 is the fastest option
   * @param {function} onStep - callback called on each frame of animation,
   *        which lets us sync other work to it.
   * @param {function} onComplete - callback called at end of animation
   */
  animateTo(dividend, speed, onStep, onComplete) {
    const MAXIMUM_TIME_PER_SEGMENT = 500 / speed;
    const MAXIMUM_TOTAL_TIME = 8000 / speed + 2000;

    this.targetDividend = dividend;
    this.startTime = Date.now();
    this.interval = setInterval(this.tick, 33);
    this.onStep = onStep || function () {};
    this.onComplete = onComplete || function () {};
    this.duration = Math.min(MAXIMUM_TOTAL_TIME, dividend * MAXIMUM_TIME_PER_SEGMENT);
    this.setState({currentDividend: 0});
  },

  tick() {
    const elapsedTime = Date.now() - this.startTime;
    if (elapsedTime < this.duration) {
      const currentDividend = Math.floor(easeOutCircular(elapsedTime, 0, this.targetDividend, this.duration));
      this.onStep(currentDividend);
      this.setState({currentDividend});
    } else {
      clearInterval(this.interval);
      this.onComplete(this.targetDividend);
      this.setState({currentDividend: this.targetDividend});
      this.interval = null;
      this.startTime = null;
      this.onStep = null;
      this.onComplete = null;
    }
  },

  renderSegments(dividend, modulus) {
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
    const modulus = Math.max(1, this.props.modulus);
    const {currentDividend} = this.state;
    const isRunning = !!this.interval;
    return (
      <div style={style.root}>
        <svg viewBox={`0 0 ${VIEWBOX_SIDE} ${VIEWBOX_SIDE}`} style={style.svg}>
          <circle
            cx={VIEWBOX_SIDE / 2}
            cy={VIEWBOX_SIDE / 2}
            r={VIEWBOX_SIDE / 2}
            fill={COLOR.clockFace}
          />
          {this.renderSegments(currentDividend, modulus)}
          <text
            x={VIEWBOX_SIDE / 2}
            y={VIEWBOX_SIDE / 2 + (isRunning ? 3 : 5)}
            textAnchor="middle"
            stroke={COLOR.valueText}
            fill={COLOR.valueText}
            style={{fontSize: isRunning ? 14 : 18}}
          >
            {currentDividend % modulus}
          </text>
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

function easeOutCircular(time, startValue, delta, duration) {
  time /= duration;
  time--;
  return delta * Math.sqrt(1 - time*time) + startValue;
}
