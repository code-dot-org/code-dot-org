import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import styles from './assessmentSelector.module.scss';

export default class AssessmentSelector extends Component {
  static propTypes = {
    assessmentList: PropTypes.array.isRequired,
    assessmentId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const {assessmentList, assessmentId, onChange} = this.props;

    // Convert assessmentList to SimpleDropdown format
    const dropdownItems = Object.values(assessmentList).map(assessment => ({
      value: assessment.id.toString(),
      text: assessment.name,
    }));

    return (
      <SimpleDropdown
        id="assessment-selector"
        name="assessment-selector"
        labelText={i18n.selectAssessment()}
        isLabelVisible={false}
        selectedValue={assessmentId?.toString()}
        onChange={event => onChange(parseInt(event.target.value))}
        items={dropdownItems}
        size="s"
        className={styles.assessmentSelector}
        dropdownTextThickness="thin"
        color="gray"
      />
    );
  }
}
