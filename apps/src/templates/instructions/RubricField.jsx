import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

const styles = {
  rubricHeader: {
    fontSize: 13,
    marginLeft: 10,
    color: color.black,
    fontFamily: '"Gotham 5r", sans-serif'
  },
  performanceLevelHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    padding: '4px 10px'
  },
  performanceLevelHeaderSelected: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    backgroundColor: color.lightest_cyan,
    borderRadius: 10,
    padding: '4px 10px'
  }
};

const rubricLevelHeaders = {
  exceeds: 'Exceeds',
  meets: 'Meets',
  approaches: 'Approaches',
  noEvidence: 'No Evidence'
};

export class RubricField extends Component {
  static propTypes = {
    showFeedbackInputAreas: PropTypes.bool,
    rubricLevel: PropTypes.string,
    rubricValue: PropTypes.string,
    disabledMode: PropTypes.bool,
    onChange: PropTypes.func,
    currentlyChecked: PropTypes.bool
  };

  handleRubricChange = event => {
    this.props.onChange(event.target.value);
  };

  render() {
    return (
      <div
        style={
          this.props.currentlyChecked
            ? styles.performanceLevelHeaderSelected
            : styles.performanceLevelHeader
        }
      >
        {this.props.showFeedbackInputAreas && (
          <input
            type={'checkbox'}
            id={this.props.rubricLevel + '-input'}
            name={'rubric'}
            value={this.props.rubricLevel}
            checked={this.props.currentlyChecked}
            onChange={this.handleRubricChange}
            disabled={this.props.disabledMode}
          />
        )}
        <details>
          <summary style={styles.rubricHeader}>
            {rubricLevelHeaders[this.props.rubricLevel]}
          </summary>
          <p>{this.props.rubricValue}</p>
        </details>
      </div>
    );
  }
}
