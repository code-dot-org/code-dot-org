import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import color from '../../util/color';

export default class TeacherOnlyMarkdown extends Component {
  static propTypes = {
    content: PropTypes.string,
  };

  render() {
    const {content} = this.props;

    if (!content) {
      return null;
    }

    return (
      <div style={styles.container}>
        <div style={styles.header}>{i18n.forTeachersOnly()}</div>
        <div style={styles.content}>
          <SafeMarkdown markdown={content} />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    margin: 20,
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: color.cyan,
    backgroundColor: color.lightest_cyan,
    borderRadius: 5,
  },
  header: {
    color: color.white,
    backgroundColor: color.cyan,
    padding: 5,
    fontSize: 18,
    ...fontConstants['main-font-bold'],
  },
  content: {
    padding: 10,
  },
};
