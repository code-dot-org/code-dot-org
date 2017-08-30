import React, {Component} from 'react';
import Checkbox from './forms/Checkbox';
import color from "../util/color";

const styles = {
  question: {
    fontSize: 16,
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    paddingBottom: 10,
    paddingTop: 10
  },
  pledge: {
    fontSize: 18,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.charcoal,
    paddingBottom: 10,
    paddingTop: 10
  },
  option: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
  },
  checkbox: {
    width: 25,
    height: 25,
    marginTop: -2,
    paddingRight: 5
  },
  button: {
    marginTop: 10,
    backgroundColor: color.orange,
    fontSize: 16,
    fontFamily: '"Gotham 4r", sans-serif',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadiusTopLeft: 3,
    borderRadiusTopRight: 3,
    borderRadiusBottomLeft: 3,
    borderRadiusBottomRight: 3,
    textDecoration: 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: 'white',
    height: 40,
    paddingLeft: 30,
    paddingRight: 30,
    lineHeight: '40px',
    boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.63)',
  }
};


const CSOptions = [
  "None",
  "Some students do an Hour of Code",
  "All student do an Hour of Code",
  "Some students do computer programming in an after-school program",
  "All students do computer programming in an after-school program",
  "Some students take at least 10 hours of computer programming is integrated into a non-Computer Science course such as Art, Math, or Science",
  "All students take at least 10 hours of computer programming is integrated into a non-Computer Science course such as Art, Math, or Science",
  "Some students take a semester or year-long computer science course that includes at least 20 hours of coding/programming",
  "All students take a semester or year-long computer science course that includes at least 20 hours of coding/programming",
  "I don’t know"
];

class CensusForm extends Component{

  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('You clicked submit!');
    event.preventDefault();
  }

  createCheckbox = label => (
    <Checkbox
      label={label}
      handleCheckboxChange={this.toggleCheckbox}
      key={label}
    />
  )

  createCSCheckboxes = () => (
    CSOptions.map(this.createCheckbox)
  )

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <div style={styles.question}>Your name</div>
          <input
            type="text"
            value={this.state.value}
            onChange={this.handleChange}
            placeholder="Your Name"
            style={styles.option}
          />
        </label>
        <label>
          <div style={styles.question}>Your email</div>
          <input
            type="text"
            value={this.state.value}
            onChange={this.handleChange}
            placeholder="you@example.com"
            style={styles.option}
          />
        </label>
        <div style={styles.question}>
          How much coding/computer programming is taught at this school? (assume for the purposes of this question that this does not include HTML/CSS, Web design, or how to use apps)
        </div>
        {this.createCSCheckboxes()}
        <label style={styles.question}>
          <input
            type="checkbox" value={this.state.value}
            checked={false}
            onChange={this.toggleCheckboxChange}
            style={styles.checkbox}
          />
          This school teaches other computing classes that do not include at least 20 hours of coding/computer programming. (For example, learning to use applications, computer literacy, web design, HTML/CSS, or other)
        </label>
        <label>
          <div style={styles.question}>
            What is your connection to this school?
          </div>
          <select value={this.state.value} onChange={this.handleChange} style={styles.option}>
            <option value="teacher" style={styles.option}>Teacher</option>
            <option value="administrator" style={styles.option}>Administrator</option>
            <option value="parent" style={styles.option}>Parent</option>
            <option value="student" style={styles.option}>Student</option>
            <option value="volunteer" style={styles.option}>Volunteer/Community Advocate</option>
            <option value="other" style={styles.option}>Other</option>
          </select>
        </label>
        <label style={styles.pledge}>
          <input
            type="checkbox" value={this.state.value}
            checked={false}
            onChange={this.toggleCheckboxChange}
            style={styles.checkbox}
          />
          I pledge to expand computer science offerings at my school, and to engage a diverse group of students, to bring opportunity to all.
        </label>
        <input
          type="submit"
          value="Submit"
          style={styles.button}
        />
      </form>
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
