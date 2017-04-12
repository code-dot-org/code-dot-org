import React from 'react';
import _ from 'lodash';
import {
  Radio,
  Checkbox,
  ControlLabel,
  FormGroup,
  HelpBlock
} from 'react-bootstrap';

const otherString = 'Other: ';

const ButtonList = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['radio', 'check']).isRequired,
    label: React.PropTypes.string.isRequired,
    groupName: React.PropTypes.string.isRequired,
    answers: React.PropTypes.array.isRequired,
    includeOther: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    selectedItems: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.string]),
    required: React.PropTypes.bool,
    validationState: React.PropTypes.string,
    errorText: React.PropTypes.string,
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
      value = Array.from(currentSelection);
    }
    this.props.onChange({
      [this.props.groupName]: value
    });
  },

  renderInputComponents() {
    const InputComponent = {
      radio: Radio,
      check: Checkbox
    }[this.props.type];

    let otherDiv;
    let answers = this.props.answers;

    if (this.props.includeOther) {
      answers = _.concat(answers, [otherString]);
      otherDiv = (
        <div>
          <span style={{verticalAlign: 'top'}}>
            {otherString}
          </span>
          <input type="text" id={this.props.groupName + '_other'} maxLength="1000"/>
        </div>
      );
    }

    const options = answers.map((answer, i) => {
      const checked = this.props.type === 'radio' ?
          (this.props.selectedItems === answer) :
          !!(this.props.selectedItems && this.props.selectedItems.indexOf(answer) >= 0);

      return (
        <InputComponent
          value={answer}
          label={answer}
          key={i}
          name={this.props.groupName}
          onChange={this.props.onChange ? this.handleChange : undefined}
          checked={this.props.onChange ? checked : undefined}
        >
          {answer === otherString ? otherDiv : answer}
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

export {
  ButtonList,
  otherString
};
