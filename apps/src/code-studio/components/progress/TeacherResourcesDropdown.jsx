import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {
  stringForType,
  resourceShape
} from '@cdo/apps/templates/courseOverview/resourceType';

const styles = {
  dropdown: {
    display: 'inline-block'
  }
};

export default class TeacherResourcesDropdown extends React.Component {
  static propTypes = {
    resources: PropTypes.arrayOf(resourceShape).isRequired,

    //For firehose
    courseId: PropTypes.number,
    unitId: PropTypes.number
  };

  handleItemClick = () => {
    if (this.props.courseId) {
      firehoseClient.putRecord(
        {
          study: 'teacher-resources',
          study_group: 'course',
          event: 'click-resource',
          data_json: JSON.stringify({
            courseId: this.props.courseId
          })
        },
        {includeUserId: true}
      );
    } else if (this.props.unitId) {
      firehoseClient.putRecord(
        {
          study: 'teacher-resources',
          study_group: 'unit',
          event: 'click-resource',
          data_json: JSON.stringify({
            unitId: this.props.unitId
          })
        },
        {includeUserId: true}
      );
    }
  };

  render() {
    const {resources} = this.props;

    return (
      <div style={styles.dropdown}>
        <DropdownButton
          text={i18n.teacherResources()}
          color={Button.ButtonColor.blue}
        >
          {resources.map(({type, link}, index) => (
            <a
              key={index}
              href={link}
              target="_blank"
              onClick={this.handleItemClick}
            >
              {stringForType[type]}
            </a>
          ))}
        </DropdownButton>
      </div>
    );
  }
}
