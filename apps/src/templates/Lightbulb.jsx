import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

export default class Lightbulb extends React.Component {
  static propTypes = {
    shouldAnimate: PropTypes.bool,
    count: PropTypes.number,
    lit: PropTypes.bool,
    size: PropTypes.number,
    style: PropTypes.object,
    isMinecraft: PropTypes.bool,
    isRtl: PropTypes.bool,
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
    let numberCircle;

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
            transform={
              this.props.isRtl
                ? 'translate(0,200) scale(10.0,10.0)'
                : 'translate(245,200) scale(10.0,10.0)'
            }
          >
            <path
              d="M22 33H8.25C7.39062 30.3359 5.67188 27.9297 3.95312 25.6094C3.52344 25.0078 3.09375 24.4062 2.66406 23.8047C0.945312 21.3125 0 18.3906 0 15.125C0 6.78906 6.70312 0 15.125 0C23.4609 0 30.25 6.78906 30.25 15.2109C30.25 18.3906 29.2188 21.3125 27.5 23.8047C27.0703 24.4062 26.6406 25.0078 26.2109 25.6094C24.4922 27.9297 22.7734 30.3359 22 33ZM15.125 44C11.2578 44 8.25 40.9922 8.25 37.125V35.75H22V37.125C22 40.9922 18.9062 44 15.125 44ZM8.25 15.125C8.25 11.3438 11.2578 8.25 15.125 8.25C15.8125 8.25 16.5 7.64844 16.5 6.875C16.5 6.1875 15.8125 5.5 15.125 5.5C9.79688 5.5 5.5 9.88281 5.5 15.125C5.5 15.8984 6.10156 16.5 6.875 16.5C7.5625 16.5 8.25 15.8984 8.25 15.125Z"
              fill="#1892E3"
            />
            <path
              d="M8.25 15.125C8.25 11.3438 11.2578 8.25 15.125 8.25C15.8125 8.25 16.5 7.64844 16.5 6.875C16.5 6.1875 15.8125 5.5 15.125 5.5C9.79688 5.5 5.5 9.88281 5.5 15.125C5.5 15.8984 6.10156 16.5 6.875 16.5C7.5625 16.5 8.25 15.8984 8.25 15.125Z"
              fill="#1892E3"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.75 6.875C14.4375 6.875 15.125 7.5625 15.125 8.33594C15.125 9.02344 14.4375 9.625 13.75 9.625C11.4297 9.625 9.625 11.5156 9.625 13.75C9.625 14.5234 8.9375 15.125 8.25 15.125C7.47656 15.125 6.875 14.5234 6.875 13.75C6.875 9.96875 9.88281 6.875 13.75 6.875Z"
              fill="white"
            />
          </g>
        </g>
      );
    }

    let countDisplay;
    if (this.props.lit && this.props.count) {
      // If there are more than nine hints, simply display "9+"
      const countText = this.props.count > 9 ? '9+' : this.props.count;
      if (this.props.isMinecraft) {
        countDisplay = (
          <g>
            <text id="hintCount" x="400" y="700" style={styles.countMinecraft}>
              {countText}
            </text>
          </g>
        );
      } else {
        countDisplay = (
          <g>
            <text
              id="hintCount"
              x={this.props.isRtl ? '380' : '495'}
              y="380"
              style={styles.count}
            >
              {countText}
            </text>
          </g>
        );
        numberCircle = (
          <g className={this.props.shouldAnimate ? 'animate-hint' : ''}>
            <circle
              cx={this.props.isRtl ? '315' : '565'}
              cy="310"
              r="125"
              fill={color.white}
              stroke={color.blockly_flyout_gray}
              strokeWidth="16"
            />
          </g>
        );
      }
    }

    return (
      <svg
        width={this.props.size}
        height={this.props.size}
        style={this.props.style}
        viewBox="0 0 612 792"
      >
        {bulbDisplay}
        {numberCircle}
        {countDisplay}
      </svg>
    );
  }
}

const styles = {
  count: {
    fontWeight: 'bold',
    fontSize: '200px',
    fill: color.light_info_500,
    fontFamily: 'Verdana, Geneva, sans-serif',
  },
  countMinecraft: {
    fontWeight: 'bold',
    fontSize: '400px',
    fill: color.white,
    stroke: color.black,
    strokeWidth: '30px',
    fontFamily: 'Verdana, Geneva, sans-serif',
  },
};
