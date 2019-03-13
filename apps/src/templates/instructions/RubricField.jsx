import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import Radium from 'radium';
import {CheckedRadioButton} from '../../lib/ui/CheckedRadioButton';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import i18n from '@cdo/locale';

const styles = {
  rubricLevelHeaders: {
    width: '100%'
  },
  detailsArea: {
    width: '100%',
    paddingTop: 2
  },
  rubricHeader: {
    fontSize: 12,
    marginLeft: 10,
    color: color.black,
    fontFamily: '"Gotham 5r", sans-serif'
  },
  performanceLevelHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    margin: '0px 8px',
    padding: 4,
    ':hover': {
      border: `solid 1px ${color.light_cyan}`,
      borderRadius: 4
    }
  },
  performanceLevelHeaderSelected: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    margin: '0px 8px',
    padding: 4,
    backgroundColor: color.lightest_cyan,
    borderRadius: 4,
    ':hover': {
      border: `solid 1px ${color.light_cyan}`,
      borderRadius: 4
    }
  },
  tooltip: {
    maxWidth: 200,
    lineHeight: '20px',
    whiteSpace: 'normal'
  },
  rubricDetails: {
    paddingLeft: 23,
    paddingTop: 5,
    fontSize: 12,
    margin: 0
  }
};

const rubricLevelHeaders = {
  exceeds: i18n.rubricExceedsHeader(),
  meets: i18n.rubricMeetsHeader(),
  approaches: i18n.rubricApproachesHeader(),
  noEvidence: i18n.rubricNoEvidenceHeader()
};

class RubricField extends Component {
  static propTypes = {
    showFeedbackInputAreas: PropTypes.bool,
    rubricLevel: PropTypes.oneOf(Object.keys(rubricLevelHeaders)).isRequired,
    rubricValue: PropTypes.string.isRequired,
    disabledMode: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    currentlyChecked: PropTypes.bool
  };

  render() {
    const performanceHeaderStyle = this.props.currentlyChecked
      ? styles.performanceLevelHeaderSelected
      : styles.performanceLevelHeader;

    const tooltipId = _.uniqueId();
    return (
      <div style={styles.rubricLevelHeaders}>
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
          <details style={styles.detailsArea}>
            <summary style={styles.rubricHeader}>
              {rubricLevelHeaders[this.props.rubricLevel]}
            </summary>
            <p style={styles.rubricDetails}>{this.props.rubricValue}</p>
          </details>
        </div>
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="div"
          effect="solid"
        >
          <div style={styles.tooltip}>{this.props.rubricValue}</div>
        </ReactTooltip>
      </div>
    );
  }
}

export default Radium(RubricField);
