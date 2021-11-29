import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupUnitEntry from './RollupUnitEntry';
import i18n from '@cdo/locale';
import {linkWithQueryParams} from '@cdo/apps/utils';
import color from '@cdo/apps/util/color';
import {unitShape} from './rollupShapes';

export default class UnitRollup extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    unit: unitShape
  };

  getPageTitle() {
    if (this.props.objectToRollUp === 'Vocabulary') {
      return i18n.rollupTitleVocab({
        title: this.props.unit.title
      });
    } else if (this.props.objectToRollUp === 'Resources') {
      return i18n.rollupTitleResources({
        title: this.props.unit.title
      });
    } else if (this.props.objectToRollUp === 'Standards') {
      return i18n.rollupTitleStandards({
        title: this.props.unit.title
      });
    } else if (this.props.objectToRollUp === 'Code') {
      return i18n.rollupTitleCode({
        title: this.props.unit.title
      });
    }
  }

  render() {
    return (
      <div>
        <a
          href={linkWithQueryParams(this.props.unit.link)}
          style={styles.navLink}
        >
          {`< ${this.props.unit.title}`}
        </a>
        <h1>{this.getPageTitle()}</h1>
        <RollupUnitEntry
          objectToRollUp={this.props.objectToRollUp}
          unit={this.props.unit}
        />
      </div>
    );
  }
}

const styles = {
  navLink: {
    fontSize: 14,
    lineHeight: '22px',
    color: color.purple,
    margin: '10px 0px'
  }
};
