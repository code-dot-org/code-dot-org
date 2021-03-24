import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupUnitEntry from './RollupUnitEntry';
import color from '@cdo/apps/util/color';

const styles = {
  main: {
    width: 700
  },
  h1: {
    color: color.teal
  }
};

export default class CourseRollup extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    units: PropTypes.array
  };

  render() {
    return (
      <div style={styles.main}>
        <h1>{`Course ${this.props.objectToRollUp}`}</h1>
        {this.props.units.map(unit => (
          <div key={unit.key}>
            <h1 style={styles.h1}>{unit.displayName}</h1>
            <RollupUnitEntry
              objectToRollUp={this.props.objectToRollUp}
              unit={unit}
            />
          </div>
        ))}
      </div>
    );
  }
}
