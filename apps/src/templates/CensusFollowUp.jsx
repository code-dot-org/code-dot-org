import React, {Component} from 'react';
import Checkbox from './forms/Checkbox';
import color from "../util/color";
import i18n from "@cdo/locale";

const styles = {
  question: {
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    paddingTop: 10,
    paddingBottom: 5
  },
  option: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
  },
  options: {
    marginLeft: 35
  },
  input: {
    height: 100,
    width: '100%',
    fontFamily: '"Gotham 3r", sans-serif',
    padding: 5
  }
};

class CensusFollowUp extends Component {

  state = {
    value: ''
  };

  handleChange = event => {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('You clicked submit!');
    event.preventDefault();
  }

  render() {
    const courseTopics = [
      i18n.censusBlockBased(),
      i18n.censusTextBased(),
      i18n.censusPhysicalComputing(),
      i18n.censusInternet(),
      i18n.censusCybersecurity(),
      i18n.censusDataAnalysis(),
      i18n.censusWebDesign(),
      i18n.censusGameDesign(),
      i18n.censusOtherDescribe(),
      i18n.iDontKnow()
    ];

    const frequencyOptions = [
      i18n.censusFrequency1(),
      i18n.censusFrequency1to3(),
      i18n.censusFrequency3plus(),
      i18n.iDontKnow()
    ];

    return (
      <div>
        <div style={styles.question}>
          {i18n.censusFollowUpHeading()}
        </div>
        <div style={styles.question}>
          {i18n.censusFollowUpTopics()}
        </div>
        <div style={styles.options}>
          {courseTopics.map((label, index) =>
            <Checkbox
              label={label}
              key={index}
              handleCheckboxChange={() => console.log("checked the box!")}
            />
          )}
        </div>
        <label>
          <div style={styles.question}>
            {i18n.censusFollowUpFrequency()}
          </div>
          <select
            value={this.state.value}
            onChange={this.handleChange}
            style={styles.option}
          >
            {frequencyOptions.map((role, index) =>
              <option
                value={role}
                key={index}
              >
                {role}
              </option>
            )}
          </select>
        </label>
        <label>
          <div style={styles.question}>
            {i18n.censusFollowUpTellUsMore()}
          </div>
          <textarea
            type="text"
            value={this.state.value}
            onChange={this.handleChange}
            style={styles.input}
          />
        </label>
      </div>
    );
  }
}

export const UnconnectedCensusFollowUp = CensusFollowUp;
