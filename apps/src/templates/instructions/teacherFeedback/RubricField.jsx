import _ from 'lodash';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';

import fontConstants from '@cdo/apps/fontConstants';
import {CheckedRadioButton} from '@cdo/apps/templates/instructions/teacherFeedback/CheckedRadioButton';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

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
    const performanceHeaderStyle = this.props.currentlyChecked
      ? styles.performanceLevelHeaderSelected
      : styles.performanceLevelHeader;

    const tooltipId = _.uniqueId();
    return (
      <div style={styles.rubricPerformanceHeaders}>
        <div
          style={performanceHeaderStyle}
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
            style={styles.detailsArea}
            open={this.state.detailsOpen}
          >
            <summary style={styles.rubricHeader} onClick={this.updateToggle}>
              {rubricPerformanceHeaders[this.props.rubricLevel]}
            </summary>
            <p style={styles.rubricDetails}>{this.props.rubricValue}</p>
          </details>
        </div>
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="div"
          effect="solid"
          disable={this.state.detailsOpen}
        >
          <div style={styles.tooltip}>{this.props.rubricValue}</div>
        </ReactTooltip>
      </div>
    );
  }
}

const styles = {
  rubricLevelHeaders: {
    width: '100%',
  },
  detailsArea: {
    width: '100%',
    paddingTop: 2,
  },
  rubricHeader: {
    fontSize: 12,
    marginLeft: 10,
    color: color.black,
    ...fontConstants['main-font-semi-bold'],
    // Don't show default summary tag outline and background on hover or focus
    outline: 'none',
    background: 'none',
  },
  performanceLevelHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    margin: '0px 8px',
    padding: 4,
    borderRadius: 4,
    border: `solid 1px ${color.white}`,
    ':hover': {
      border: `solid 1px ${color.light_cyan}`,
    },
  },
  performanceLevelHeaderSelected: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    margin: '0px 8px',
    padding: 4,
    backgroundColor: color.lightest_cyan,
    borderRadius: 4,
    border: `solid 1px ${color.white}`,
    ':hover': {
      border: `solid 1px ${color.light_cyan}`,
    },
  },
  tooltip: {
    maxWidth: 200,
    lineHeight: '20px',
    whiteSpace: 'normal',
  },
  rubricDetails: {
    paddingLeft: 23,
    paddingTop: 5,
    fontSize: 12,
    margin: 0,
  },
};
export const UnwrappedRubricField = RubricField;
export default Radium(RubricField);
