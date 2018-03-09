import React, { Component, PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import trophy from '!!file-loader!./images/trophy.svg';

const styles = {
  main: {
    marginLeft: 4,
  },
};

export default class StageExtrasProgressBubble extends Component {
  static propTypes = {
    percentPerfect: PropTypes.number.isRequired,
  };

  render() {
    const ratio = this.props.percentPerfect;
    const percentage = Math.round(ratio * 100);

    const theta = Math.PI * 2 * ratio;
    const x = Math.cos(theta) * 18;
    const y = Math.sin(theta) * 18;

    const largeArc = (ratio > 0.5) ? 1 : 0;
    const close = (ratio === 1) ? 'Z' : '';

    return (
      <svg
        style={styles.main}
        width="50"
        height="90"
      >
        <g transform="translate(7, 27)">
          <g transform="translate(18, 18)">
            <circle
              r="25"
              fill="white"
            />
            <circle
              r="20"
              fill={color.lighter_gray}
            />
            <circle
              r="16"
              fill={color.lightest_gray}
            />
            <g transform="rotate(-90)">
              <path
                d={`M 18 0.00001 A 18 18 0 ${largeArc} 1 ${x} ${y}${close}`}
                fill="none"
                stroke={color.level_perfect}
                strokeWidth="3"
              />
            </g>
          </g>
          <g transform="translate(6, 8)">
            <use
              href={`${trophy}#trophy`}
              transform="scale(0.04)"
              fill={color.lighter_gray}
            />
          </g>
        </g>
        <g transform="translate(25, 70)">
          <text
            textAnchor="middle"
            alignmentBaseline="hanging"
            fill={color.level_perfect}
            fontSize="14"
            fontFamily='"Gotham 5r", sans-serif'
          >
            {percentage}%
          </text>
        </g>
      </svg>
    );
  }
}
