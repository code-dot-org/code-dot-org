import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {linkWithQueryParams} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {courseShape} from './rollupShapes';
import RollupUnitEntry from './RollupUnitEntry';

import style from './courseRollup.module.scss';

export default class CourseRollup extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    course: courseShape,
  };

  getPageTitle() {
    if (this.props.objectToRollUp === 'Vocabulary') {
      return i18n.rollupTitleVocab({
        title: this.props.course.title,
      });
    } else if (this.props.objectToRollUp === 'Resources') {
      return i18n.rollupTitleResources({
        title: this.props.course.title,
      });
    } else if (this.props.objectToRollUp === 'Standards') {
      return i18n.rollupTitleStandards({
        title: this.props.course.title,
      });
    } else if (this.props.objectToRollUp === 'Code') {
      return i18n.rollupTitleCode({
        title: this.props.course.title,
      });
    }
  }

  render() {
    return (
      <div className={style.rollupPage}>
        <a
          href={linkWithQueryParams(this.props.course.link)}
          className={style.navLink}
        >
          {`< ${this.props.course.title}`}
        </a>
        <Typography
          variant="inherit"
          component="h1"
          className={style.pageTitle}
        >
          {this.getPageTitle()}
        </Typography>
        {this.props.course.units.map(unit => (
          <div key={unit.name}>
            <Typography
              variant="inherit"
              component="h3"
              className={style.unitTitle}
            >
              {unit.title}
            </Typography>
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
