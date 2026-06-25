import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {linkWithQueryParams} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {unitShape} from './rollupShapes';
import RollupUnitEntry from './RollupUnitEntry';

import style from './courseRollup.module.scss';

export default class UnitRollup extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    unit: unitShape,
  };

  getPageTitle() {
    if (this.props.objectToRollUp === 'Vocabulary') {
      return i18n.rollupTitleVocab({
        title: this.props.unit.title,
      });
    } else if (this.props.objectToRollUp === 'Resources') {
      return i18n.rollupTitleResources({
        title: this.props.unit.title,
      });
    } else if (this.props.objectToRollUp === 'Standards') {
      return i18n.rollupTitleStandards({
        title: this.props.unit.title,
      });
    } else if (this.props.objectToRollUp === 'Code') {
      return i18n.rollupTitleCode({
        title: this.props.unit.title,
      });
    }
  }

  render() {
    return (
      <div className={style.rollupPage}>
        <a
          href={linkWithQueryParams(this.props.unit.link)}
          className={style.navLink}
        >
          {`< ${this.props.unit.title}`}
        </a>
        <Typography
          variant="inherit"
          component="h1"
          className={style.pageTitle}
        >
          {this.getPageTitle()}
        </Typography>
        <RollupUnitEntry
          objectToRollUp={this.props.objectToRollUp}
          unit={this.props.unit}
        />
      </div>
    );
  }
}
