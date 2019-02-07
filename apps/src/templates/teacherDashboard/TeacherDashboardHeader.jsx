import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SmallChevronLink from '../SmallChevronLink';
import SelectSectionDropdown from './SelectSectionDropdown';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';

const styles = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  }
};

export default class TeacherDashboardHeader extends React.Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired
  };

  render() {
    return (
      <div>
        <SmallChevronLink
          link="/home#classroom-sections"
          linkText={i18n.viewAllSections()}
          isRtl={true}
          chevronSide="left"
        />
        <div style={styles.headerContainer}>
          <h1>{this.props.sectionName}</h1>
          <SelectSectionDropdown />
        </div>
        <TeacherDashboardNavigation />
      </div>
    );
  }
}
