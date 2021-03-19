import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupUnitEntry from './RollupUnitEntry';

const styles = {
  main: {
    width: 700
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
          <RollupUnitEntry
            objectToRollUp={this.props.objectToRollUp}
            unit={unit}
            key={unit.key}
          />
        ))}
      </div>
    );
  }
}
