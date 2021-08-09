import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export default class EmptySection extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired
  };

  render() {
    const {sectionId} = this.props;

    return (
      <div style={styles.text}>
        <SafeMarkdown
          markdown={i18n.emptySection({
            url: `/teacher_dashboard/sections/${sectionId}/manage_students`
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
    paddingTop: 10
  }
};
