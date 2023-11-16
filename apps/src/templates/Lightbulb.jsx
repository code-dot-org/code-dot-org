import PropTypes from 'prop-types';
import React from 'react';
import color from '../util/color';

export default class Lightbulb extends React.Component {
  static propTypes = {
    shouldAnimate: PropTypes.bool,
    count: PropTypes.number,
    lit: PropTypes.bool,
    size: PropTypes.number,
    style: PropTypes.object,
    isMinecraft: PropTypes.bool,
  };

  static defaultProps = {
    shouldAnimate: false,
    count: 0,
    lit: true,
    size: 40,
    style: {},
  };

  render() {
    let bulbDisplay;

    if (this.props.isMinecraft) {
      const href = this.props.lit
        ? 'iVBORw0KGgoAAAANSUhEUgAAAAsAAAAOCAYAAAD5YeaVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA' +
          'IGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACzSURBVHjalJExDsIw' +
          'DEW/GzbYG4m5A505BzuH6cQpEGdg6TlYWLp0rpSOiHZrZIaGCsfNwJcsR8mT/fVDkGJokToAYNdV' +
          'yO1ZkqZcuEyA+RHgFsgOc3EL9s2ykQT4K3Oau68BKkCmxAYp+VpdZfhDCh7GSfS1WITvYZyw2waH' +
          'wS8A+k4mu7+g7x/RqEJEF4tdV/H7dWf2DcefpNK43gjAM5SUgq21yTQU7JxLwmvGOfX+GQDlKDxF' +
          'gn7+bgAAAABJRU5ErkJggg=='
        : 'iVBORw0KGgoAAAANSUhEUgAAAAsAAAAOCAYAAAD5YeaVAAAABmJLR0QA/wD/AP+gvaeTAAAACXBI' +
          'WXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AsRFQUQP8g1cwAAAKpJREFUKM+VkbENxCAMRR+nK1JH' +
          'AmWCZIVMkWHZAyktmSCioKbzVRfBGYr7jRF+sj8fQytBy6gDIN579n1vSOfcw71qcF1Xcs5Ya7HW' +
          'knMmpfRsNDVYa9s2AGKMzPOMc443A8UY1d2LP6TgUkpTe7E0vkspTNME8PgFzHeyOY6D67qaSTXY' +
          'syXeeznPU1JK8vtJKo0QAiGE7gMVvCzLMA0F3/c9hHvGZdT/APfyQc3umPvfAAAAAElFTkSuQmCC';

      bulbDisplay = (
        <g className={this.props.shouldAnimate ? 'animate-hint' : ''}>
          <image
            width="450"
            height="450"
            x="80"
            y="140"
            className="pixelated"
            xlinkHref={'data:image/png;base64,' + href}
          />
        </g>
      );
    } else {
      bulbDisplay = (
        <g className={this.props.shouldAnimate ? 'animate-hint' : ''}>
          <g
            transform="translate(150,600) scale(0.75,-0.75)"
            fill={this.props.lit ? color.light_info_500 : '#dddddd'}
            stroke="none"
          >
            <path
              d="M108 531 c-54 -35 -88 -96 -88 -162 0 -34 9 -59 36 -105 20 -32 44
          -71 53 -86 15 -27 19 -28 102 -28 l85 0 18 33 c9 17 32 57 51 87 27 41 35 65
          35 99 0 107 -83 191 -190 191 -45 0 -65 -6 -102 -29z m122 -51 c0 -11 -7 -20
          -15 -20 -38 0 -74 -30 -85 -71 -8 -29 -16 -39 -28 -37 -43 8 -8 107 48 135 40
          20 80 17 80 -7z"
            />
            <path
              d="M130 79 c0 -55 58 -91 110 -69 33 14 50 37 50 69 0 19 -6 21 -80 21
          -74 0 -80 -2 -80 -21z"
            />
          </g>
        </g>
      );
    }

    let countDisplay;
    if (this.props.lit && this.props.count) {
      // If there are more than nine hints, simply display "9+"
      const countText = this.props.count > 9 ? '9+' : this.props.count;
      countDisplay = (
        <g>
          <text id="hintCount" x="400" y="700" style={styles.count}>
            {countText}
          </text>
        </g>
      );
    }

    return (
      <svg
        width={this.props.size}
        height={this.props.size}
        style={this.props.style}
        viewBox="0 0 612 792"
      >
        {bulbDisplay}
        {countDisplay}
      </svg>
    );
  }
}

const styles = {
  count: {
    fontWeight: 'bold',
    fontSize: '400px',
    fill: color.white,
    stroke: color.black,
    strokeWidth: '30px',
    fontFamily: 'Verdana, Geneva, sans-serif',
  },
};
