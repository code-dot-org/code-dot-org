import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import {styles} from './censusFormStyles';
import Checkbox from './Checkbox';

class FollowUpQuestions extends Component {

  static propTypes = {
    courseTopics: PropTypes.array,
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
      </div>
    );
  }
}

export default FollowUpQuestions;
