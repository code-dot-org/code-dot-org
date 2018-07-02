import React, { Component, PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import trophy from '!!file-loader!./images/trophy.svg';

const styles = {
  main: {
    marginLeft: 'auto',
  },
};

export default class StageTrophyProgressBubble extends Component {
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

    let shapeColor = color.level_perfect;
    if (ratio === 1) {
      shapeColor = color.yellow;
    } else if (ratio === 0) {
      shapeColor = color.lighter_gray;
    }

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
              r="19.8"
              fill={color.lighter_gray}
            />
            <circle
              r="16.2"
              fill={ratio === 1 ? color.white : color.lightest_gray}
            />
            <g transform="rotate(-90)">
              <path
                d={`M 18 0.00001 A 18 18 0 ${largeArc} 1 ${x} ${y}${close}`}
                fill="none"
                stroke={shapeColor}
                strokeWidth="3"
              />
            </g>
          </g>
          <g transform="translate(6, 8)">
            <use
              href={`${trophy}#trophy`}
              transform="scale(0.04)"
              fill={ratio === 1 ? color.yellow : color.lighter_gray}
            />
          </g>
        </g>
        <g transform="translate(25, 70)">
          <text
            textAnchor="middle"
            alignmentBaseline="hanging"
            fill={shapeColor}
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
