import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';
import classNames from 'classnames';

export default class EmptySection extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
  };

  render() {
    const {sectionId} = this.props;

    return (
      <div style={classNames(styles.text, dashboardStyles.dashboardPage)}>
        <SafeMarkdown
          markdown={i18n.emptySection({
            url: `/teacher_dashboard/sections/${sectionId}/manage_students`,
          })}
        />
      </div>
    );
  }
}

const styles = {
  text: {
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 10,
  },
};
