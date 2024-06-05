import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React, {Component} from 'react';

import locale from '@cdo/locale';

import color from '../util/color';

const newStyles = {
  puzzleRatingButton: {
    fill: color.light_gray,
    cursor: 'pointer',
    display: 'inline-block',
    backgroundColor: color.lightest_gray,
    borderColor: color.light_gray,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: '5px 5px 0px',
    ':active': {
      backgroundColor: color.lighter_gray,
    },
  },
  like: {
    borderRadius: '2px 0px 0px 2px',
  },
  likeDisabled: {
    ':hover': {
      fill: '#333',
    },
  },
  likeEnabled: {
    fill: color.red,
    backgroundColor: color.lighter_gray,
    ':hover': {
      fill: color.dark_red,
    },
  },
  dislike: {
    borderRadius: '0px 2px 2px 0px',
  },
  dislikeDisabled: {
    ':hover': {
      fill: color.dark_gray,
    },
  },
  dislikeEnabled: {
    fill: color.cyan,
    backgroundColor: color.lighter_gray,
    ':hover': {
      fill: color.dark_blue,
    },
  },
};

const legacyStyles = {
  puzzleRatingButton: {
    verticalAlign: 'middle',
  },
  question: {
    fontSize: 16,
    color: color.light_gray,
    marginRight: 10,
  },
};

class PuzzleRatingButtons extends Component {
  constructor() {
    super();
    this.state = {
      liked: false,
      disliked: false,
    };
  }

  static propTypes = {
    useLegacyStyles: PropTypes.bool,
    label: PropTypes.string,
  };

  like() {
    this.setState({liked: !this.state.liked, disliked: false});
  }

  dislike() {
    this.setState({liked: false, disliked: !this.state.disliked});
  }

  render() {
    const styles = this.props.useLegacyStyles ? legacyStyles : newStyles;
    const label = this.props.label || locale.puzzleRatingQuestion();
    return (
      <div id="puzzleRatingButtons" style={{display: 'inline-block'}}>
        {this.props.useLegacyStyles && (
          <span style={styles.question}>{label}</span>
        )}
        <a
          className={
            (this.state.liked ? 'enabled' : '') +
            ' ' +
            (this.props.useLegacyStyles ? 'puzzle-rating-btn' : '')
          }
          id="like"
          key="like"
          data-value="1"
          onClick={this.like.bind(this)}
          style={[
            styles.puzzleRatingButton,
            styles.like,
            this.state.liked ? styles.likeEnabled : styles.likeDisabled,
          ]}
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="27px"
            height="27px"
            viewBox="0 0 26.055 21.058"
            enableBackground="new 0 0 26.055 21.058"
            xmlSpace="preserve"
            value="1"
          >
            <path d="M14.426,2.5c0.986-1.348,2.83-2.5,5.092-2.5c3.613,0,6.537,3.044,6.537,6.537 c0,2.357-1.076,3.709-1.894,4.525c-0.941,0.941-8.082,8.082-9.113,9.113c-1.244,1.243-3.019,1.137-4.246-0.09 c-1.314-1.314-7.158-7.158-9.131-9.131C0.408,9.693,0,8.113,0,6.537C0,2.926,3.197,0,6.537,0c2.451,0,4.438,1.508,5.188,2.535 C12.4,3.459,13.643,3.564,14.426,2.5z" />
          </svg>
        </a>

        <a
          className={
            (this.state.disliked ? 'enabled' : '') +
            ' ' +
            (this.props.useLegacyStyles ? 'puzzle-rating-btn' : '')
          }
          id="dislike"
          key="dislike"
          data-value="0"
          onClick={this.dislike.bind(this)}
          style={[
            styles.puzzleRatingButton,
            styles.dislike,
            this.state.disliked
              ? styles.dislikeEnabled
              : styles.dislikeDisabled,
          ]}
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="27px"
            height="27px"
            viewBox="382.321 292.82 26.37 26.371"
            enableBackground="new 382.321 292.82 26.37 26.371"
            xmlSpace="preserve"
          >
            <path d="M395.506,292.82c-7.282,0.002-13.184,5.904-13.185,13.185c0.001,7.283,5.902,13.184,13.185,13.186 c7.281-0.002,13.183-5.902,13.185-13.186C408.689,298.725,402.787,292.822,395.506,292.82z M402.5,313 c-1.795,1.793-4.257,2.896-6.994,2.898c-2.737-0.002-5.199-1.105-6.994-2.898c-1.794-1.795-2.897-4.258-2.897-6.994 s1.103-5.199,2.897-6.994c1.795-1.793,4.257-2.897,6.994-2.897s5.199,1.104,6.994,2.897c1.792,1.795,2.896,4.258,2.896,6.994 S404.292,311.205,402.5,313z M391.317,304.951c1.054,0,1.907-0.854,1.907-1.906c0-1.053-0.854-1.906-1.907-1.906 c-1.054,0-1.907,0.854-1.907,1.906C389.41,304.098,390.264,304.951,391.317,304.951z M399.691,304.951 c1.053,0,1.906-0.854,1.906-1.906c0-1.053-0.853-1.906-1.906-1.906s-1.907,0.854-1.907,1.906 C397.784,304.098,398.639,304.951,399.691,304.951z M391.773,311.928c1.037-1.035,2.379-1.543,3.739-1.545 c1.352,0.002,2.689,0.512,3.724,1.545c0.642,0.643,1.685,0.643,2.328,0c0.645-0.643,0.645-1.686,0-2.33 c-1.665-1.666-3.864-2.51-6.052-2.508h-0.008c-2.185,0-4.39,0.838-6.06,2.51c-0.642,0.643-0.643,1.686,0,2.328 C390.088,312.571,391.131,312.571,391.773,311.928z" />
          </svg>
        </a>
      </div>
    );
  }
}
export default Radium(PuzzleRatingButtons);
