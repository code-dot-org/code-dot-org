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

  handleDropdownClick = () => {
    let data_json = {};
    let study_group = '';
    if (this.props.courseId) {
      study_group = 'course';
      data_json = {
        courseId: this.props.courseId
      };
    } else if (this.props.unitId) {
      study_group = 'unit';
      data_json = {
        unitId: this.props.unitId
      };
    }
    firehoseClient.putRecord(
      {
        study: 'teacher-resources',
        study_group: study_group,
        event: 'click-dropdown',
        data_json: JSON.stringify(data_json)
      },
      {includeUserId: true}
    );
  };

  handleItemClick = () => {
    let data_json = {};
    let study_group = '';
    if (this.props.courseId) {
      study_group = 'course';
      data_json = {
        courseId: this.props.courseId
      };
    } else if (this.props.unitId) {
      study_group = 'unit';
      data_json = {
        unitId: this.props.unitId
      };
    }
    firehoseClient.putRecord(
      {
        study: 'teacher-resources',
        study_group: study_group,
        event: 'click-resource',
        data_json: JSON.stringify(data_json)
      },
      {includeUserId: true}
    );
  };

  render() {
    const {resources} = this.props;

    return (
      <div style={styles.dropdown}>
        <DropdownButton
          text={i18n.teacherResources()}
          color={Button.ButtonColor.blue}
          onClick={this.handleDropdownClick}
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
