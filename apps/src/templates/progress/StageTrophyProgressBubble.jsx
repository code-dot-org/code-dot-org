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
    const percentage = Math.round(this.props.percentPerfect * 100);
    return (
      <svg
        style={styles.main}
        width="50"
        height="90"
      >
        <g transform="translate(5, 25)">
          <circle
            cx="20"
            cy="20"
            r="25"
            fill="white"
          />
          <circle
            cx="20"
            cy="20"
            r="20"
            fill={color.light_gray}
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill={color.lightest_gray}
          />
          <path
            d="M 20 2 A 18 18 0 1 1 2 20"
            fill="none"
            stroke={color.level_perfect}
            strokeWidth="3"
          />
          <g transform="translate(8, 10)">
            <use
              href={`${trophy}#trophy`}
              transform="scale(0.04)"
              fill={color.light_gray}
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
