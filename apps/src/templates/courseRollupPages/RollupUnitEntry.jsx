import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupLessonEntry from './RollupLessonEntry';

export default class RollupUnitEntry extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    unit: PropTypes.object
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
