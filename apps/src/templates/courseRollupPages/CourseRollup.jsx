import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupUnitEntry from './RollupUnitEntry';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

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
    units: PropTypes.array,
    title: PropTypes.string
  };

  getPageTitle() {
    if (this.props.objectToRollUp === 'Vocabulary') {
      return i18n.courseRollupTitleVocab({
        courseTitle: this.props.title
      });
    } else if (this.props.objectToRollUp === 'Resources') {
      return i18n.courseRollupTitleResources({
        courseTitle: this.props.title
      });
    } else if (this.props.objectToRollUp === 'Standards') {
      return i18n.courseRollupTitleStandards({
        courseTitle: this.props.title
      });
    } else if (this.props.objectToRollUp === 'Code') {
      return i18n.courseRollupTitleStandards({
        courseTitle: this.props.title
      });
    }
  }

  render() {
    return (
      <div style={styles.main}>
        <h1>{this.getPageTitle()}</h1>
        {this.props.units.map(unit => (
          <div key={unit.name}>
            <h3 style={styles.h1}>{unit.title}</h3>
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
