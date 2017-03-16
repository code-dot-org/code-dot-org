import React from 'react';

import RadioFormGroup from './RadioFormGroup';
import CheckboxFormGroup from './CheckboxFormGroup';

const SINGLE_SELECT = 'single_select';
const MULTI_SELECT = 'multi_select';
const FREE_RESPONSE = 'free_response';

const questionPropType = React.PropTypes.shape({
  label: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  required: React.PropTypes.bool,
  type: React.PropTypes.oneOf([SINGLE_SELECT, MULTI_SELECT, FREE_RESPONSE]).isRequired,
  values: React.PropTypes.arrayOf(React.PropTypes.string),
});

const ColumnVariableQuestion = React.createClass({
  propTypes: {
    selectedValues: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    question: questionPropType
  },

  buildColumn(selectedValue) {
    const key = `${this.props.question.name}[${selectedValue}]`;

    let formGroup;
    if (this.props.question.type === SINGLE_SELECT) {
      formGroup = <RadioFormGroup name={key} values={this.props.question.values} />;
    } else if (this.props.question.type === MULTI_SELECT) {
      formGroup = <CheckboxFormGroup name={key} values={this.props.question.values} />;
    }

    return (<td key={key}>{formGroup}</td>);
  },

  render() {
    return (
      <tr>
        <td>
          <label>
            {this.props.question.label}
            {this.props.question.required && <span className="form-required-field">*</span>}
          </label>
        </td>
        {this.props.selectedValues.map(this.buildColumn)}
      </tr>
    );
  }
});

const RowVariableQuestion = React.createClass({
  propTypes: {
    selectedValues: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    question: questionPropType
  },

  buildRow(selectedValue) {
    const label = this.props.question.label.replace("{value}", selectedValue);
    const key = `${this.props.question.name}[${selectedValue}]`;

    return (
      <div className="form-group" key={key}>
        <label className="control-label" htmlFor={key}>
          {label}
        </label>
        <textarea className="form-control" name={key} rows={4} type="text" />
      </div>
    );
  },

  render() {
    return (
      <div>
        {this.props.selectedValues.map(this.buildRow)}
      </div>
    );
  }
});

const VariableFormGroup = React.createClass({
  propTypes: {
    sourceLabel: React.PropTypes.string.isRequired,
    sourceName: React.PropTypes.string.isRequired,
    sourceValues: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    columnVariableQuestions: React.PropTypes.arrayOf(questionPropType),
    rowVariableQuestions: React.PropTypes.arrayOf(questionPropType),
  },

  getInitialState() {
    return {
      selected: []
    };
  },

  setSelected(values) {
    this.setState({
      selected: values
    });
  },

  render() {
    const columnQuestions = this.props.columnVariableQuestions.map(question => (
      <ColumnVariableQuestion
        key={question.name}
        question={question}
        selectedValues={this.state.selected}
      />
    ));

    const rowQuestions = this.props.rowVariableQuestions.map(question => (
      <RowVariableQuestion
        key={question.name}
        question={question}
        selectedValues={this.state.selected}
      />
    ));

    const tdStyle = {
      width: `${100 / (this.state.selected.length + 1)}%`
    };

    return (
      <div className="form-group">
        <CheckboxFormGroup
          onChange={this.setSelected}
          label={this.props.sourceLabel}
          name={this.props.sourceName}
          values={this.props.sourceValues}
        />
        <table>
          <thead>
            <tr>
              <th style={tdStyle}></th>
              {this.state.selected.map(value => <th key={value} style={tdStyle}><label>{value}</label></th>)}
            </tr>
          </thead>
          <tbody>
            {columnQuestions}
          </tbody>
        </table>
        {rowQuestions}
      </div>
    );
  }
});

export default VariableFormGroup;
