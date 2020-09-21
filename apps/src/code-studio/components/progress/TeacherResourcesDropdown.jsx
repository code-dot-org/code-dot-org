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
    unitGroupId: PropTypes.number,
    unitId: PropTypes.number
  };

  handleDropdownClick = () => {
    if (this.props.unitGroupId) {
      this.recordFirehose('unit-group', 'click-dropdown', {
        unitGroupId: this.props.unitGroupId
      });
    } else if (this.props.unitId) {
      this.recordFirehose('unit', 'click-dropdown', {
        unitId: this.props.unitId
      });
    }
  };

  handleItemClick = () => {
    if (this.props.unitGroupId) {
      this.recordFirehose('unit-group', 'click-resource', {
        unitGroupId: this.props.unitGroupId
      });
    } else if (this.props.unitId) {
      this.recordFirehose('unit', 'click-resource', {
        unitId: this.props.unitId
      });
    }
  };

  recordFirehose = (study_group, event, data_json) => {
    firehoseClient.putRecord(
      {
        study: 'teacher-resources',
        study_group: study_group,
        event: event,
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
