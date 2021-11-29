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
import {resourceShape as migratedResourceShape} from '@cdo/apps/lib/levelbuilder/shapes';

export default class ResourcesDropdown extends React.Component {
  static propTypes = {
    resources: PropTypes.arrayOf(resourceShape),
    migratedResources: PropTypes.arrayOf(migratedResourceShape),
    useMigratedResources: PropTypes.bool.isRequired,
    studentFacing: PropTypes.bool,

    //For firehose
    unitGroupId: PropTypes.number,
    unitId: PropTypes.number
  };

  handleDropdownClick = () => {
    const study = !!this.props.studentFacing
      ? 'student-resources'
      : 'teacher-resources';
    if (this.props.unitGroupId) {
      this.recordFirehose(study, 'unit-group', 'click-dropdown', {
        unitGroupId: this.props.unitGroupId
      });
    } else if (this.props.unitId) {
      this.recordFirehose(study, 'unit', 'click-dropdown', {
        unitId: this.props.unitId
      });
    }
  };

  handleItemClick = (e, resource) => {
    // Needed so that we can keep the href on the link to allow for standard link interactions
    e.preventDefault();
    const study = !!this.props.studentFacing
      ? 'student-resources'
      : 'teacher-resources';
    const resourceKey = this.props.useMigratedResources
      ? resource.key
      : resource.type;
    const resourceUrl = this.props.useMigratedResources
      ? resource.url
      : resource.link;
    const callback = () => {
      window.open(resourceUrl, 'noopener', 'noreferrer');
    };

    if (this.props.unitGroupId) {
      this.recordFirehose(
        study,
        'unit-group',
        'click-resource',
        {
          unitGroupId: this.props.unitGroupId,
          resourceKey: resourceKey
        },
        callback
      );
    } else if (this.props.unitId) {
      this.recordFirehose(
        study,
        'unit',
        'click-resource',
        {
          unitId: this.props.unitId,
          resourceKey: resourceKey
        },
        callback
      );
    }
  };

  recordFirehose = (study, study_group, event, data_json, callback) => {
    firehoseClient.putRecord(
      {
        study,
        study_group: study_group,
        event: event,
        data_json: JSON.stringify(data_json)
      },
      {includeUserId: true, callback}
    );
  };

  render() {
    const {resources, migratedResources, useMigratedResources} = this.props;

    const dropdownResources = useMigratedResources
      ? migratedResources.map(resource => (
          <a
            key={resource.key}
            href={resource.url}
            onClick={e => this.handleItemClick(e, resource)}
          >
            {resource.name}
          </a>
        ))
      : resources.map((resource, index) => (
          <a
            key={index}
            href={resource.link}
            onClick={e => this.handleItemClick(e, resource)}
          >
            {stringForType[resource.type]}
          </a>
        ));
    return (
      <div style={styles.dropdown}>
        <DropdownButton
          text={
            this.props.studentFacing
              ? i18n.studentResources()
              : i18n.teacherResources()
          }
          color={
            this.props.studentFacing
              ? Button.ButtonColor.gray
              : Button.ButtonColor.blue
          }
          size={
            this.props.studentFacing
              ? Button.ButtonSize.large
              : Button.ButtonSize.default
          }
          onClick={this.handleDropdownClick}
        >
          {dropdownResources}
        </DropdownButton>
      </div>
    );
  }
}

const styles = {
  dropdown: {
    display: 'inline-block',
    marginRight: 5
  }
};
