import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';
import {NavLink} from 'react-router-dom';
import {TeacherDashboardPath} from './TeacherDashboardNavigation';
import styles from './teacher-dashboard.module.scss';

export default class EmptySection extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    const {className} = this.props;

    return (
      <div className={className}>
        <img src={emptyDesk} alt={'empty desk'} />
        <Heading3>{i18n.emptySectionHeadline()}</Heading3>
        <BodyTwoText>{i18n.emptySectionDescription()}</BodyTwoText>
        <NavLink
          key={TeacherDashboardPath.manageStudents}
          to={TeacherDashboardPath.manageStudents}
          className={styles.navLink}
        >
          {i18n.addStudents()}
        </NavLink>
      </div>
    );
  }
}
