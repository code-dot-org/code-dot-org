import React from 'react';

import {ButtonList} from '../form_components/button_list';

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

    let type;
    if (this.props.question.type === SINGLE_SELECT) {
      type = 'radio';
    } else if (this.props.question.type === MULTI_SELECT) {
      type = 'check';
    }

    const formGroup = (
      <ButtonList
        answers={this.props.question.values}
        groupName={key}
        label={""}
        type={type}
      />
    );

    return (<td key={key}>{formGroup}</td>);
  },

  render() {
    return (
      <tr>
        <td>
          <label className="control-label">
            {this.props.question.label}
            {this.props.question.required && <span className="form-required-field"> *</span>}
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

  hasNoSourceValues() {
    return this.props.sourceValues.length === 0;
  },

  hasSingleSourceValue() {
    return this.props.sourceValues.length === 1;
  },

  getInitialState() {
    // If we have only a single sourceValue, select it by default
    let selected = [];
    if (this.hasSingleSourceValue()) {
      selected = [this.props.sourceValues[0]];
    }

    return {selected};
  },

  setSelected(values) {
    this.setState({
      selected: values[this.props.sourceName]
    });
  },

  render() {
    if (this.hasNoSourceValues()) {
      // If we have no source values, we have nothing to render. Return an empty
      // form group
      return (<div className="form-group" />);
    }

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
        {this.hasSingleSourceValue() ?
          <input type="hidden" name={this.props.sourceName} value={this.props.sourceValues[0]} /> :
          <ButtonList
            answers={this.props.sourceValues}
            groupName={this.props.sourceName}
            label={this.props.sourceLabel}
            onChange={this.setSelected}
            selectedItems={this.state.selected}
            required={true}
            type={'check'}
          />
        }
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
