import PropTypes from 'prop-types';
import React, {Component} from 'react';

export default class LessonOverview extends Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    overview: PropTypes.string
  };

  render() {
    const {displayName, overview} = this.props;
    return (
      <div>
        <h1>Lesson "{displayName}"</h1>

        <h2>Overview</h2>
        <p>{overview}</p>
      </div>
    );
  }
}
