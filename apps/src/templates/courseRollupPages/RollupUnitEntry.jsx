import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupLessonEntry from './RollupLessonEntry';
import color from '@cdo/apps/util/color';

const styles = {
  h1: {
    color: color.teal
  }
};

export default class RollupUnitEntry extends Component {
  static propTypes = {
    unit: PropTypes.object
  };

  render() {
    return (
      <div>
        <h1 style={styles.h1}>{this.props.unit.displayName}</h1>
        {this.props.unit.lessons.map(lesson => (
          <RollupLessonEntry lesson={lesson} />
        ))}
      </div>
    );
  }
}
