import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import PropTypes from 'prop-types';
import React from 'react';

import {resourceShape} from '@cdo/apps/levelbuilder/shapes';
import i18n from '@cdo/locale';

export default class ResourcesDropdown extends React.Component {
  static propTypes = {
    resources: PropTypes.arrayOf(resourceShape).isRequired,
    studentFacing: PropTypes.bool,
  };

  openResource = url => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  render() {
    const {resources, studentFacing} = this.props;
    const labelText = studentFacing
      ? i18n.studentResources()
      : i18n.teacherResources();

    const options = resources.map(resource => ({
      value: resource.key,
      label: resource.name,
      onClick: () => this.openResource(resource.url),
      icon: {iconName: 'arrow-up-right-from-square'},
    }));

    return (
      <div style={styles.dropdown}>
        <ActionDropdown
          name={
            studentFacing
              ? 'student-resources-dropdown'
              : 'teacher-resources-dropdown'
          }
          labelText={labelText}
          options={options}
          useIconButton={false}
          size="s"
          triggerButtonProps={{
            variant: 'outlined',
            color: 'tertiary',
            size: 'small',
            startIcon: <FontAwesomeV6Icon iconName="caret-down" />,
            children: labelText,
          }}
        />
      </div>
    );
  }
}

const styles = {
  dropdown: {
    display: 'inline-block',
    marginRight: 5,
  },
};
