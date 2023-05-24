import PropTypes from 'prop-types';
import React from 'react';
import {Radio, ControlLabel, FormGroup, Table} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

const questionPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
});

class QuestionRow extends React.Component {
  constructor(props) {
    super(props);
    this.buildColumn = this.buildColumn.bind(this);
    this.getValidationState = this.getValidationState.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  getValidationState() {
    if (
      this.props.errors &&
      this.props.errors.includes(this.props.question.name)
    ) {
      return 'error';
    }
  }

  handleChange(event) {
    const value = event.target.value;
    this.props.onChange &&
      this.props.onChange({
        [this.props.question.name]: value,
      });
  }

  buildColumn(option, i) {
    const key = this.props.question.name;
    const checked = this.props.data && this.props.data[key] === option;

    return (
      <td key={key + i}>
        <FormGroup controlId={key} validationState={this.getValidationState()}>
          <Radio
            name={key}
            value={option}
            checked={checked}
            onChange={this.handleChange}
          />
        </FormGroup>
      </td>
    );
  }

  render() {
    return (
      <tr>
        <td>
          <FormGroup
            controlId={this.props.question.name}
            validationState={this.getValidationState()}
          >
            <ControlLabel>
              {this.props.question.label}
              {this.props.question.required && (
                <span className="form-required-field"> *</span>
              )}
            </ControlLabel>
          </FormGroup>
        </td>
        {this.props.options.map(this.buildColumn)}
      </tr>
    );
  }
}

QuestionRow.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  question: questionPropType,
};

export default class QuestionsTable extends React.Component {
  render() {
    const columns = this.props.options.length + this.props.labelSpan;

    const thStyle = {
      width: `${100 / columns}%`,
      backgroundColor: '#00b2c0',
      color: 'white',
    };

    const labelThStyle = {
      ...thStyle,
      width: `${(this.props.labelSpan * 100) / columns}%`,
    };

    return (
      <FormGroup>
        <ControlLabel>{this.props.label}</ControlLabel>
        <Table striped bordered>
          <thead>
            <tr>
              <th style={labelThStyle} />
              {this.props.options.map(option => (
                <th key={option} style={thStyle}>
                  <ControlLabel>{option}</ControlLabel>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {this.props.questions.map(question => (
              <QuestionRow
                key={question.name}
                question={question}
                data={this.props.data}
                errors={this.props.errors}
                onChange={this.props.onChange}
                options={this.props.options}
              />
            ))}
          </tbody>
        </Table>
      </FormGroup>
    );
  }
}

QuestionsTable.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.arrayOf(PropTypes.string),
  labelSpan: PropTypes.number,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  questions: PropTypes.arrayOf(questionPropType).isRequired,
  label: PropTypes.string,
};

QuestionsTable.defaultProps = {
  labelSpan: 1,
};
