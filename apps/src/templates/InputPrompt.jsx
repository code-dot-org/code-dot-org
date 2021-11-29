import PropTypes from 'prop-types';
import React, {Component} from 'react';

const fontSize = 18;

/**
 * Simple input dialog to prompt for user input.
 */
export default class InputPrompt extends Component {
  static propTypes = {
    question: PropTypes.string.isRequired,
    onInputReceived: PropTypes.func.isRequired,
    currentValue: PropTypes.string
  };
  state = {value: this.props.currentValue};

  handleSubmit = e => {
    e.preventDefault();
    this.props.onInputReceived(this.refs.answer.value);
  };

  componentDidMount() {
    this.refs.answer.focus();
  }

  render() {
    return (
      <form style={styles.form} onSubmit={this.handleSubmit}>
        <div style={styles.wrapper}>
          <label style={styles.question}>{this.props.question}</label>
          <input
            ref="answer"
            value={this.state.value}
            onChange={e => this.setState({value: e.target.value})}
            type="text"
            style={styles.input}
          />
          <input type="submit" className="btn" style={styles.submit} />
        </div>
      </form>
    );
  }
}

const styles = {
  form: {
    background: '#fff'
  },
  wrapper: {
    margin: 20
  },
  question: {
    fontSize: fontSize
  },
  input: {
    fontSize: fontSize,
    width: '100%',
    height: '2em',
    boxSizing: 'border-box'
  },
  submit: {
    fontSize: fontSize
  }
};
