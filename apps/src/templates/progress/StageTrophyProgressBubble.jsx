import React, { Component } from 'react';
import trophy from '!!file-loader!./images/trophy.svg';

export default class StageExtrasProgressBubble extends Component {
  render() {
    return (
      <svg
        width="40"
        height="40"
      >
        <path
          d="M 20 0 A 20 20 0 1 1 0 20"
          fill="none"
          stroke="black"
          strokeWidth="3"
        />
        <g transform="translate(8, 10)">
          <use
            href={`${trophy}#trophy`}
            transform="scale(0.04)"
          />
        </g>
      </svg>
    );
  }
}
