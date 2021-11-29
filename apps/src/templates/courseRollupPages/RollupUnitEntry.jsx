import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupLessonEntry from './RollupLessonEntry';
import {unitShape} from './rollupShapes';

export default class RollupUnitEntry extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    unit: unitShape
  };

  render() {
    return (
      <div>
        {this.props.unit.lessons.map(lesson => (
          <RollupLessonEntry
            objectToRollUp={this.props.objectToRollUp}
            lesson={lesson}
            key={lesson.key}
          />
        ))}
      </div>
    );
  }
}
