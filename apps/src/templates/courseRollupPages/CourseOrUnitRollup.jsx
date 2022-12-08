import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupUnitEntry from './RollupUnitEntry';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {linkWithQueryParams} from '@cdo/apps/utils';
import {courseShape, unitShape} from './rollupShapes';

export default class CourseOrUnitRollup extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    shape: PropTypes.oneOfType([courseShape, unitShape])
  };

  getPageTitle() {
    if (this.props.objectToRollUp === 'Vocabulary') {
      return i18n.rollupTitleVocab({
        title: this.props.shape.title
      });
    } else if (this.props.objectToRollUp === 'Resources') {
      return i18n.rollupTitleResources({
        title: this.props.shape.title
      });
    } else if (this.props.objectToRollUp === 'Standards') {
      return i18n.rollupTitleStandards({
        title: this.props.shape.title
      });
    } else if (this.props.objectToRollUp === 'Code') {
      return i18n.rollupTitleCode({
        title: this.props.shape.title
      });
    }
  }

  renderMultipleUnits() {
    const units = this.props.shape.units;
    return (
      <div>
        {units.map(unit => (
          <div key={unit.name}>
            <h3 style={styles.h1}>{unit.title}</h3>
            {this.renderSingleUnit(unit)}
          </div>
        ))}
      </div>
    );
  }

  renderSingleUnit(unit) {
    return (
      <RollupUnitEntry objectToRollUp={this.props.objectToRollUp} unit={unit} />
    );
  }

  render() {
    // Shape is either a single unit or a course with multiple units to display.
    // Render the specific structure depending on shape
    const renderedUnits = this.props.shape.units
      ? this.renderMultipleUnits()
      : this.renderSingleUnit(this.props.shape);

    return (
      <div>
        <a
          href={linkWithQueryParams(this.props.shape.link)}
          style={styles.navLink}
        >
          {`< ${this.props.shape.title}`}
        </a>
        <h1>{this.getPageTitle()}</h1>
        {renderedUnits}
      </div>
    );
  }
}

const styles = {
  h1: {
    color: color.teal
  },
  navLink: {
    fontSize: 14,
    lineHeight: '22px',
    color: color.purple,
    margin: '10px 0px'
  }
};
