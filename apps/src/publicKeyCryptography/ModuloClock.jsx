/** @file Centered animated Modulo Clock component for the Crypto widget levels */
import _ from 'lodash';
import React, {PropTypes} from 'react';
import color from "../util/color";

// Defines the coordinate scale for SVG elements
const VIEWBOX_SIDE = 100;
const HALF_VIEWBOX_SIDE = VIEWBOX_SIDE / 2;
// Above this size, the slices of the clock will have less space between them
const SMALL_GAPS_OVER_MODULUS = 200;
// Above this size, the clock will not render individual slices
const CONTINUOUS_METER_OVER_MODULUS = 400;
// Thickness of border that flashes when animation completes
const OUTER_BORDER_WIDTH = 1;
// Radius of the outer edge of a wedge clock segment
const WEDGE_OUTER_RADIUS = 48;
// Radius of the inner edge of a wedge clock segment
const WEDGE_INNER_RADIUS = 25;
// How long to wait on the last value before ending the animation:
// Switching to the larger number and in the case of a zero, fading to an empty pie.
const FINALIZATION_DELAY = 200;

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
  },
  fadeFill: {
    transition: 'fill 1.5s'
  }
};

export default class ModuloClock extends React.Component {
  static propTypes = {
    modulus: PropTypes.number
  };

  state = {
    startTime: null,
    currentDividend: 0
  };

  /**
   * @param {number} dividend - The left-hand-side of the modulus operation
   * @param {number} maximumDuration - The longest the clock animation should
   *        take, in milliseconds.
   * @param {function} onStep - callback called on each frame of animation,
   *        which lets us sync other work to it.
   * @param {function} onComplete - callback called at end of animation
   */
  animateTo(dividend, maximumDuration, onStep, onComplete) {
    // Avoid very slow animations: If there are less than 10 segments, or we
    // would spend more than a second per segment, we won't end up using the
    // full animation time.
    const maximumTimePerSegment = Math.min(1000, maximumDuration / 10);

    this.targetDividend = dividend;
    this.interval = setInterval(this.tick, 33);
    this.onStep = onStep || function () {};
    this.onComplete = onComplete || function () {};
    this.duration = Math.min(maximumDuration, dividend * maximumTimePerSegment);
    this.setState({startTime: Date.now(), currentDividend: 0});
  }

  tick = () => {
    const elapsedTime = Date.now() - this.state.startTime;
    if (elapsedTime < this.duration - FINALIZATION_DELAY) {
      // What dividend should we render on this frame? Ask the easing function.
      const currentDividend = Math.floor(easeOutCircular(elapsedTime, 0, this.targetDividend, this.duration));
      this.onStep(currentDividend);
      this.setState({currentDividend});
    } else if (this.state.currentDividend !== this.targetDividend) {
      // Snap to final value, but there's one more step before the animation ends.
      this.setState({currentDividend: this.targetDividend});
    } else if (elapsedTime >= this.duration) {
      // End the animation once the final value has been shown for a moment.
      clearInterval(this.interval);
      this.onComplete(this.targetDividend);
      this.interval = null;
      this.onStep = null;
      this.onComplete = null;
      this.setState({startTime: null});
    }
  };

  renderSegments(dividend, modulus, isRunning) {
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
      const segmentCount = modulus;
      const wedgePath = createWedgePath((2 * Math.PI / segmentCount) - segmentGapRadians);
      return _.range(0, segmentCount).map(n => {
        // When running we want R=0 to be a full pie, for a nice smooth
        // animation (that doesn't skip a pie slice).
        // When not running we want R=0 to be an empty pie, to accurately
        // represent the final result.
        // Also when not running we enable a fade effect.
        // Together these create the special situation where you animate to a
        // full pie (d%m=0), stop animating, and fade to an empty pie.
        const isSegmentFull = n < result || (isRunning && 0 === result);
        return (
          <path
            key={n}
            d={wedgePath}
            transform={`rotate(${n  * 360 / segmentCount} 50 50)`}
            fill={isSegmentFull ? COLOR.fullWedge : COLOR.emptyWedge}
            style={!isRunning ? style.fadeFill : {}}
          />
        );
      });
    }
  }

  render() {
    const modulus = Math.max(1, this.props.modulus);
    const {startTime, currentDividend} = this.state;
    const isRunning = startTime !== null;
    return (
      <div style={style.root}>
        <svg viewBox={`0 0 ${VIEWBOX_SIDE} ${VIEWBOX_SIDE}`} style={style.svg}>
          <circle
            cx={HALF_VIEWBOX_SIDE}
            cy={HALF_VIEWBOX_SIDE}
            r={HALF_VIEWBOX_SIDE}
            fill={isRunning && currentDividend === this.targetDividend ? COLOR.fullWedge : COLOR.clockFace}
            style={!isRunning ? style.fadeFill : {}}
          />
          <circle
            cx={HALF_VIEWBOX_SIDE}
            cy={HALF_VIEWBOX_SIDE}
            r={HALF_VIEWBOX_SIDE - OUTER_BORDER_WIDTH}
            fill={COLOR.clockFace}
          />
          {this.renderSegments(currentDividend, modulus, isRunning)}
          <text
            x={HALF_VIEWBOX_SIDE}
            y={HALF_VIEWBOX_SIDE + (isRunning ? 3 : 5)}
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
}

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
  const x1 = HALF_VIEWBOX_SIDE;
  const y1 = (HALF_VIEWBOX_SIDE) - r1;
  const y2 = (HALF_VIEWBOX_SIDE) - r2;
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
