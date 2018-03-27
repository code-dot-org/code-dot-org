import React, {PropTypes, Component} from 'react';

const fontSize = 18;
const styles = {
  form: {
    margin: 10,
    background: '#fff',
    border: '3px solid #000',
    borderRadius: 5,
  },
  wrapper: {
    margin: 20,
  },
  question: {
    fontSize: fontSize,
  },
  input: {
    fontSize: fontSize,
    width: '100%',
    height: '2em',
    boxSizing: 'border-box',
  },
  submit: {
    fontSize: fontSize,
  }
};

/**
 * Simple input dialog to prompt for user input.
 */
export default class InputPrompt extends Component {
  static propTypes = {
    question: PropTypes.string.isRequired,
    onInputReceived: PropTypes.func.isRequired,
  };

  handleSubmit = (e) => {
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
          <p style={styles.question}>{this.props.question}</p>
          <input ref="answer" type="text" style={styles.input} />
          <input type="submit" className="btn" style={styles.submit} />
        </div>
      </form>
    );
  }
}
