import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
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
    resources: PropTypes.arrayOf(resourceShape).isRequired
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
            <a key={index} href={link} target="_blank">
              {stringForType[type]}
            </a>
          ))}
        </DropdownButton>
      </div>
    );
  }
}
