import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {
  Radio,
  Checkbox,
  ControlLabel,
  FormGroup,
  HelpBlock
} from 'react-bootstrap';

import utils from './utils';

const otherString = 'Other:';

const styles = {
  inputLabel: {
    verticalAlign: 'top',
    marginRight: 15
  }
};

class ButtonList extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['radio', 'check']).isRequired,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
      .isRequired,
    groupName: PropTypes.string.isRequired,
    answers: PropTypes.arrayOf(
      PropTypes.oneOfType([
        // Standard string answer ...
        // (see typedef SimpleAnswer in utils)
        PropTypes.string,

        // ... or an answer followed by an input for additional text ...
        // (see typedef ExtraInputAnswer in utils)
        PropTypes.shape({
          answerText: PropTypes.string.isRequired,
          inputId: PropTypes.string,
          inputValue: PropTypes.string,
          onInputChange: PropTypes.func
        }),

        // ... or an answer with different strings for display vs value.
        // (see typedef Answer in utils)
        PropTypes.shape({
          answerText: PropTypes.string.isRequired,
          answerValue: PropTypes.string.isRequired
        })
      ])
    ).isRequired,
    includeOther: PropTypes.bool,
    onChange: PropTypes.func,
    selectedItems: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    required: PropTypes.bool,
    validationState: PropTypes.string,
    errorText: PropTypes.string,
    columnCount: PropTypes.number,
    suppressLineBreak: PropTypes.bool
  };

  static defaultProps = {
    suppressLineBreak: false
  };

  handleChange = event => {
    let value;
    if (this.props.type === 'radio') {
      value = event.target.value;
    } else if (this.props.type === 'check') {
      const currentSelection = new Set(this.props.selectedItems);
      if (event.target.checked) {
        currentSelection.add(event.target.value);
      } else {
        currentSelection.delete(event.target.value);
      }
      value = currentSelection.size > 0 ? Array.from(currentSelection) : null;
    }
    this.props.onChange({
      [this.props.groupName]: value
    });
  };

  handleAnswerInputChange(answer, event) {
    answer.onInputChange(event.target.value);
  }

  renderInputComponents() {
    const InputComponent = {
      radio: Radio,
      check: Checkbox
    }[this.props.type];

    let answers = this.props.answers;

    if (this.props.includeOther) {
      answers = _.concat(answers, {
        answerText: otherString,
        inputId: `${this.props.groupName}_other`
      });
    }

    const options = answers.map((answer, i) => {
      const {answerText, answerValue} = utils.normalizeAnswer(answer);

      const checked =
        this.props.type === 'radio'
          ? this.props.selectedItems === answerValue
          : !!(
              this.props.selectedItems &&
              this.props.selectedItems.indexOf(answerValue) >= 0
            );

      return (
        <InputComponent
          value={answerValue}
          label={answerText}
          key={i}
          name={this.props.groupName}
          onChange={this.props.onChange ? this.handleChange : undefined}
          checked={this.props.onChange ? checked : undefined}
        >
          {typeof answer === 'object' && answer.answerValue === undefined ? (
            <div>
              <span style={styles.inputLabel}>{answerText}</span>
              &nbsp;
              <input
                type="text"
                value={
                  answer.onInputChange ? answer.inputValue || '' : undefined
                }
                id={answer.inputId}
                maxLength="200"
                onChange={
                  answer.onInputChange
                    ? this.handleAnswerInputChange.bind(this, answer)
                    : undefined
                }
              />
            </div>
          ) : (
            answerText
          )}
        </InputComponent>
      );
    });

    return options;
  }

  render() {
    let validationState = this.props.validationState;
    if (this.props.errorText) {
      validationState = 'error';
    }

    const columnCount = this.props.columnCount ? this.props.columnCount : 1;

    return (
      <FormGroup
        id={this.props.groupName}
        controlId={this.props.groupName}
        validationState={validationState}
      >
        <ControlLabel>
          {this.props.label}
          {this.props.required && <span style={{color: 'red'}}> *</span>}
        </ControlLabel>
        <FormGroup style={{columnCount: columnCount}}>
          {this.renderInputComponents()}
        </FormGroup>
        {this.props.errorText && <HelpBlock>{this.props.errorText}</HelpBlock>}
        {!this.props.suppressLineBreak && <br />}
      </FormGroup>
    );
  }
}

export default ButtonList;
export {ButtonList, otherString};
