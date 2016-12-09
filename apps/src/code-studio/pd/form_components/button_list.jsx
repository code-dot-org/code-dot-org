import React from 'react';
import {Radio, Checkbox, ControlLabel, FormGroup} from 'react-bootstrap';

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

  renderInputCompontents() {
    const InputComponent = {radio: Radio, check: Checkbox}[this.props.type];

    const options = this.props.answers.map ( (answer, i) => {
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
          {answer}
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
          {this.renderInputCompontents()}
        </FormGroup>
        <br/>
      </div>
    );
  }
});

export default ButtonList;
