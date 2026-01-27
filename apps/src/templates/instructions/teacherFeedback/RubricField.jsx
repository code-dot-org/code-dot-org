import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';

import {CheckedRadioButton} from '@cdo/apps/templates/instructions/teacherFeedback/CheckedRadioButton';
import i18n from '@cdo/locale';

import styles from './RubricField.module.scss';

const rubricPerformanceHeaders = {
  performanceLevel1: i18n.rubricLevelOneHeader(),
  performanceLevel2: i18n.rubricLevelTwoHeader(),
  performanceLevel3: i18n.rubricLevelThreeHeader(),
  performanceLevel4: i18n.rubricLevelFourHeader(),
};

class RubricField extends Component {
  static propTypes = {
    showFeedbackInputAreas: PropTypes.bool,
    rubricLevel: PropTypes.oneOf(Object.keys(rubricPerformanceHeaders))
      .isRequired,
    rubricValue: PropTypes.string.isRequired,
    disabledMode: PropTypes.bool,
    onChange: PropTypes.func,
    currentlyChecked: PropTypes.bool,
    expandByDefault: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      detailsOpen: this.props.expandByDefault,
    };
  }

  updateToggle = event => {
    event.preventDefault();
    this.setState({detailsOpen: !this.state.detailsOpen});
  };

  render() {
    const performanceHeaderClass = classNames(
      styles.performanceLevelHeader,
      this.props.currentlyChecked && styles.performanceLevelHeaderSelected
    );

    const tooltipId = _.uniqueId();
    return (
      <div className={styles.rubricPerformanceHeaders}>
        <div
          className={performanceHeaderClass}
          data-tip
          data-for={tooltipId}
          aria-describedby={tooltipId}
        >
          {this.props.showFeedbackInputAreas && (
            <CheckedRadioButton
              id={`rubric-input-${this.props.rubricLevel}`}
              value={this.props.rubricLevel}
              checked={this.props.currentlyChecked}
              onRadioButtonChange={this.props.onChange}
              disabledMode={this.props.disabledMode}
            />
          )}
          <details
            id={`rubric-details-${this.props.rubricLevel}`}
            className={styles.detailsArea}
            open={this.state.detailsOpen}
          >
            <summary
              className={styles.rubricHeader}
              onClick={this.updateToggle}
            >
              {rubricPerformanceHeaders[this.props.rubricLevel]}
            </summary>
            <p className={styles.rubricDetails}>{this.props.rubricValue}</p>
          </details>
        </div>
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="div"
          effect="solid"
          disable={this.state.detailsOpen}
        >
          <div className={styles.tooltip}>{this.props.rubricValue}</div>
        </ReactTooltip>
      </div>
    );
  }
}
export const UnwrappedRubricField = RubricField;
export default RubricField;
