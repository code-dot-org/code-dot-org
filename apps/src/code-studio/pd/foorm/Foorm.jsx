import PropTypes from 'prop-types';
import React from 'react';

const styles = {
  questionText: {
    fontSize: 14,
    marginBottom: 10
  },
  submitButton: {
    backgroundColor: '#ffa400',
    color: 'white',
    marginLeft: 0,
    border: 'none',
    fontSize: 16
  }
};

export default class Foorm extends React.Component {
  static propTypes = {
    formData: PropTypes.object.isRequired,
    substitutes: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      submitted: false,
      errors: []
    };
  }

  submit = () => {
    this.setState({submitting: true});

    this.submitRequest = $.ajax({
      method: 'POST',
      url: 'tbd',
      contentType: 'application/json',
      data: JSON.stringify({form_data: {}}),
      complete: result => {
        this.onSubmitComplete(result);
      }
    });
  };

  handleChange = change => {
    this.setState(change);
  };

  onSubmitComplete = results => {
    if (
      results.responseJSON &&
      results.responseJSON.errors &&
      results.responseJSON.errors.form_data
    ) {
      if (results.responseJSON.errors.form_data) {
        this.setState({
          errors: results.responseJSON.errors.form_data,
          submitting: false
        });
      }
    } else if (results.responseJSON) {
      this.setState({submitted: true, submitting: false});
    } else {
      this.setState({submitted: false, submitting: false});
    }
  };

  doSubstitutes(string, substitutes) {
    for (var key in substitutes) {
      string = string.replace('{{' + key + '}}', substitutes[key]);
    }
    return string;
  }

  render() {
    if (this.state.submitted) {
      return <div>Thank you for submitting</div>;
    } else {
      return (
        <form>
          {this.props.formData.questions.map(question => (
            <div key={question.id}>
              <div>
                <div style={styles.questionText}>
                  {this.doSubstitutes(question.text, this.props.substitutes)}
                </div>
              </div>
              <div>
                {question.type === 'text_multiline' && <textarea rows="5" />}
                {question.type === 'dropdown' && (
                  <select>
                    {question.options.map(option => (
                      <option value={option.id} key={option.id}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
          <button type="submit" style={styles.submitButton}>
            Submit
          </button>
        </form>
      );
    }
  }
}
