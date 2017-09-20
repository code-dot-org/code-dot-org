import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import {styles} from './censusFormStyles';
import {frequencyOptions} from './censusQuestions';
import Checkbox from './Checkbox';
import Dropdown from './Dropdown';

class FollowUpQuestions extends Component {

  static propTypes = {
    courseTopics: PropTypes.array,
    followUpFrequency: PropTypes.string,
    followUpMore: PropTypes.string
  }

  render() {
    const {courseTopics} = this.props;
    return (
      <div>
        <div style={styles.question}>
          {i18n.censusFollowUp()}
          <span style={styles.asterisk}> *</span>
        </div>
        <div style={styles.options}>
          {courseTopics.map((courseTopic, index) =>
            <div key={index}>
              <Checkbox
                field={courseTopic.field}
                label={courseTopic.label}
                name={courseTopic.name}
                checked={courseTopic.checked}
                setField={this.toggle}
              />
            </div>
          )}
        </div>
        <Dropdown
          field="followUpFrequency"
          label={i18n.censusFollowUpFrequency()}
          name="followup_frequency_s"
          value={this.props.followUpFrequency}
          dropdownOptions={frequencyOptions}
          required={true}
        />
        <label>
          <div style={styles.question}>
            {i18n.censusFollowUpTellUsMore()}
          </div>
          <textarea
            type="text"
            name="followup_more_s"
            value={this.props.followUpMore}
            onChange={this.handleChange}
            style={styles.textArea}
          />
        </label>
      </div>
    );
  }
}

export default FollowUpQuestions;
