import PropTypes from 'prop-types';
import React, {Component} from 'react';
import RollupUnitEntry from './RollupUnitEntry';
import i18n from '@cdo/locale';

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
      return i18n.rollupTitleStandards({
        title: this.props.unit.title
      });
    }
  }

  render() {
    return (
      <div style={styles.main}>
        <h1>{this.getPageTitle()}</h1>
        <RollupUnitEntry
          objectToRollUp={this.props.objectToRollUp}
          unit={this.props.unit}
        />
      </div>
    );
  }
}
