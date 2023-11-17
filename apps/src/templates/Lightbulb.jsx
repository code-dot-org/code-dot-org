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
            transform="translate(215,200) scale(3.0,3.0)"
            fill={this.props.lit ? color.light_info_500 : '#dddddd'}
            stroke="none"
          >
            <path
              fill="#4390DD"
              opacity="1.000000"
              stroke="none"
              d="
                M56.536816,1.000000 
                  C57.629982,1.662783 58.179958,2.797304 58.901588,2.919691 
                  C79.563499,6.423919 96.670036,25.780333 96.156898,47.574181 
                  C95.859924,60.186592 91.326591,70.232185 83.337196,79.790329 
                  C78.051895,86.113419 74.868683,94.193588 70.455956,101.997162 
                  C58.119095,101.997162 44.966827,102.033951 31.815742,101.925995 
                  C30.784891,101.917542 29.134047,101.132423 28.830803,100.315163 
                  C24.732895,89.271179 16.459011,80.817116 10.757892,70.863419 
                  C2.146063,55.827854 2.272013,39.818199 11.038393,24.595938 
                  C18.129124,12.283335 28.914471,4.871443 43.181450,2.857701 
                  C43.726036,2.780834 44.178730,2.052944 44.337124,1.314210 
                  C48.024544,1.000000 52.049088,1.000000 56.536816,1.000000 
                M19.696592,59.604115 
                  C20.679148,61.712593 21.415388,63.984753 22.688297,65.900291 
                  C27.379389,72.959671 32.141823,79.978874 37.149448,86.813889 
                  C38.037510,88.026024 40.197609,88.807037 41.816463,88.890350 
                  C46.968204,89.155479 52.151699,88.802788 57.303558,89.066757 
                  C61.141602,89.263420 63.375916,87.737694 65.309715,84.479584 
                  C68.183067,79.638458 71.347633,74.908142 74.889938,70.537247 
                  C87.628784,54.818623 85.643867,33.869534 71.208557,22.305559 
                  C59.600632,13.006577 43.318714,12.440539 32.484810,20.108541 
                  C19.555838,29.259390 14.740491,43.547241 19.696592,59.604115 
                z"
            />
            <path
              fill="#4490DD"
              opacity="1.000000"
              stroke="none"
              d="
                M38.468651,135.000000 
                  C36.973907,133.561798 36.067478,132.017380 34.901272,130.703552 
                  C29.492775,124.610382 27.961607,117.521126 29.366529,109.326508 
                  C43.320168,109.326508 57.368351,109.326508 71.804100,109.326508 
                  C72.139076,119.112076 70.132149,127.864182 62.660934,134.758301 
                  C54.979099,135.000000 46.958202,135.000000 38.468651,135.000000 
                z"
            />
            <path
              fill="#1992E3"
              opacity="1.000000"
              stroke="none"
              d="
                M19.563274,59.224182 
                  C14.740491,43.547241 19.555838,29.259390 32.484810,20.108541 
                  C43.318714,12.440539 59.600632,13.006577 71.208557,22.305559 
                  C85.643867,33.869534 87.628784,54.818623 74.889938,70.537247 
                  C71.347633,74.908142 68.183067,79.638458 65.309715,84.479584 
                  C63.375916,87.737694 61.141602,89.263420 57.303558,89.066757 
                  C52.151699,88.802788 46.968204,89.155479 41.816463,88.890350 
                  C40.197609,88.807037 38.037510,88.026024 37.149448,86.813889 
                  C32.141823,79.978874 27.379389,72.959671 22.688297,65.900291 
                  C21.415388,63.984753 20.679148,61.712593 19.563274,59.224182 
                M26.057043,39.919949 
                  C26.024195,40.249638 25.993023,40.579502 25.958235,40.908989 
                  C25.628416,44.032658 25.525265,47.391193 29.607470,47.743687 
                  C33.329632,48.065090 33.771587,45.062946 34.201500,42.024521 
                  C35.042831,36.078339 38.609093,32.720722 45.132416,31.514956 
                  C48.136265,30.959728 51.073364,30.422525 50.178226,26.488392 
                  C49.372330,22.946491 46.381016,22.702312 43.411385,23.262665 
                  C34.409412,24.961283 28.674284,30.279844 26.057043,39.919949 
                z"
            />
            <path
              fill="#F7FBFE"
              opacity="1.000000"
              stroke="none"
              d="
                M26.122486,39.509232 
                  C28.674284,30.279844 34.409412,24.961283 43.411385,23.262665 
                  C46.381016,22.702312 49.372330,22.946491 50.178226,26.488392 
                  C51.073364,30.422525 48.136265,30.959728 45.132416,31.514956 
                  C38.609093,32.720722 35.042831,36.078339 34.201500,42.024521 
                  C33.771587,45.062946 33.329632,48.065090 29.607470,47.743687 
                  C25.525265,47.391193 25.628416,44.032658 25.958235,40.908989 
                  C25.993023,40.579502 26.024195,40.249638 26.122486,39.509232 
                // eslint-disable-next-line prettier/prettier
                z"
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
