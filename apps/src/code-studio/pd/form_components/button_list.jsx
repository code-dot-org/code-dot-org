import React from 'react';
import _ from 'lodash';
import {Radio, Checkbox, ControlLabel, FormGroup} from 'react-bootstrap';

const otherString = 'Other: ';

const ButtonList = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['radio', 'check']).isRequired,
    label: React.PropTypes.string.isRequired,
    groupName: React.PropTypes.string.isRequired,
    answers: React.PropTypes.array.isRequired,
    includeOther: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    selectedItems: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.string])
  },

  renderInputComponents() {
    const InputComponent = {radio: Radio, check: Checkbox}[this.props.type];
    let otherDiv;

    let answers = this.props.answers;

    if (this.props.includeOther) {
      answers = _.concat(answers, [otherString]);
      otherDiv = (
        <div>
          <span style={{verticalAlign: 'top'}}>
            {otherString}
          </span>
          <input type="text" id={this.props.groupName + '_other'}/>
        </div>
      );
    }

    const options = answers.map ( (answer, i) => {
      const checked = this.props.type === 'radio' ? (this.props.selectedItems === answer) : !!(this.props.selectedItems && this.props.selectedItems.indexOf(answer) >= 0);
      return (
        <InputComponent
          value={answer}
          label={answer}
          key={i}
          name={this.props.groupName}
          onChange={this.props.onChange}
          checked={checked}
        >
          {answer === otherString ? otherDiv : answer}
        </InputComponent>
      );
    });

    return options;
  },

  render() {
    return (
      <div>
        <ControlLabel>
          {this.props.label}
        </ControlLabel>
        <FormGroup id={this.props.groupName}>
          {this.renderInputComponents()}
        </FormGroup>
        <br/>
      </div>
    );
  }
});

export {ButtonList, otherString};
