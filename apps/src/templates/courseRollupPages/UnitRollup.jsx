import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupUnitEntry from './RollupUnitEntry';

const styles = {
  main: {
    width: 700
  }
};

export default class UnitRollup extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    unit: PropTypes.object
  };

  render() {
    return (
      <div style={styles.main}>
        <h1>{`Unit ${this.props.objectToRollUp}`}</h1>
        <RollupUnitEntry
          objectToRollUp={this.props.objectToRollUp}
          unit={this.props.unit}
        />
      </div>
    );
  }
}
