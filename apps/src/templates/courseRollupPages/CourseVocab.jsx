import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupUnitEntry from './RollupUnitEntry';

const styles = {
  main: {
    width: 700
  }
};

export default class CourseVocab extends Component {
  static propTypes = {
    units: PropTypes.array
  };

  render() {
    return (
      <div style={styles.main}>
        Course Vocab
        {this.props.units.map(unit => (
          <RollupUnitEntry unit={unit} key={unit.key} />
        ))}
      </div>
    );
  }
}
