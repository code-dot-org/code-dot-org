import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupUnitEntry from './RollupUnitEntry';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {linkWithQueryParams} from '@cdo/apps/utils';
import {courseShape} from './rollupShapes';

export default class CourseRollup extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    course: courseShape
  };

  getPageTitle() {
    if (this.props.objectToRollUp === 'Vocabulary') {
      return i18n.rollupTitleVocab({
        title: this.props.course.title
      });
    } else if (this.props.objectToRollUp === 'Resources') {
      return i18n.rollupTitleResources({
        title: this.props.course.title
      });
    } else if (this.props.objectToRollUp === 'Standards') {
      return i18n.rollupTitleStandards({
        title: this.props.course.title
      });
    } else if (this.props.objectToRollUp === 'Code') {
      return i18n.rollupTitleCode({
        title: this.props.course.title
      });
    }
  }

  render() {
    return (
      <div>
        <a
          href={linkWithQueryParams(this.props.course.link)}
          style={styles.navLink}
        >
          {`< ${this.props.course.title}`}
        </a>
        <h1>{this.getPageTitle()}</h1>
        {this.props.course.units.map(unit => (
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
