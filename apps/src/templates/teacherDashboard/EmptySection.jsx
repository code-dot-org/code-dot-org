import PropTypes from 'prop-types';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

export default class EmptySection extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
  };

  render() {
    const {sectionId} = this.props;

    return (
      <div style={styles.text}>
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
