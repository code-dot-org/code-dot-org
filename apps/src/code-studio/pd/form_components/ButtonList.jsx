import React, {PropTypes} from 'react';
import _ from 'lodash';
import {
  Radio,
  Checkbox,
  ControlLabel,
  FormGroup,
  HelpBlock
} from 'react-bootstrap';

const otherString = 'Other:';

const styles = {
  inputLabel: {
    verticalAlign: 'top',
    marginRight: 15
  }
};

const ButtonList = React.createClass({
  propTypes: {
    type: PropTypes.oneOf(['radio', 'check']).isRequired,
    label: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]).isRequired,
    groupName: PropTypes.string.isRequired,
    answers: PropTypes.arrayOf(
     PropTypes.oneOfType([
       // Standard string answer
       PropTypes.string,

       // or an answer followed by an input for additional text
       PropTypes.shape({
         answerText: PropTypes.string.isRequired,
         inputId: PropTypes.string,
         inputValue: PropTypes.string,
         onInputChange: PropTypes.func
       })
     ])
    ).isRequired,
    includeOther: PropTypes.bool,
    onChange: PropTypes.func,
    selectedItems: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    required: PropTypes.bool,
    validationState: PropTypes.string,
    errorText: PropTypes.string,
  },

  handleChange(event) {
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
  },

  handleAnswerInputChange(answer, event) {
    answer.onInputChange(event.target.value);
  },

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
      const answerText = typeof answer === "string" ? answer : answer.answerText;

      const checked = this.props.type === 'radio' ?
          (this.props.selectedItems === answerText) :
          !!(this.props.selectedItems && this.props.selectedItems.indexOf(answerText) >= 0);

      return (
        <InputComponent
          value={answerText}
          label={answerText}
          key={i}
          name={this.props.groupName}
          onChange={this.props.onChange ? this.handleChange : undefined}
          checked={this.props.onChange ? checked : undefined}
        >
          {typeof answer === "object" ?
            <div>
              <span style={styles.inputLabel}>
                {answerText}
              </span>
              &nbsp;
              <input
                type="text"
                value={answer.onInputChange ? answer.inputValue || "" : undefined}
                id={answer.inputId}
                maxLength="200"
                onChange={answer.onInputChange ? this.handleAnswerInputChange.bind(this, answer) : undefined}
              />
            </div>
            :
            answerText
          }
        </InputComponent>
      );
    });

    return options;
  },

  render() {
    let validationState = this.props.validationState;
    if (this.props.errorText) {
      validationState = 'error';
    }
    return (
      <FormGroup
        id={this.props.groupName}
        controlId={this.props.groupName}
        validationState={validationState}
      >
        <ControlLabel>
          {this.props.label}
          {this.props.required && (<span style={{color: 'red'}}> *</span>)}
        </ControlLabel>
        <FormGroup>
          {this.renderInputComponents()}
        </FormGroup>
        {this.props.errorText && <HelpBlock>{this.props.errorText}</HelpBlock>}
        <br/>
      </FormGroup>
    );
  }
});

export default ButtonList;
export {
  ButtonList,
  otherString
};
