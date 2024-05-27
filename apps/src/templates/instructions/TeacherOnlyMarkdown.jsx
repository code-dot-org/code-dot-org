import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import color from '../../util/color';

export default class TeacherOnlyMarkdown extends Component {
  static propTypes = {
    content: PropTypes.string,
    hideContainer: PropTypes.bool,
  };

  renderMarkdownContent() {
    const {content} = this.props;
    return (
      <div style={styles.content}>
        <SafeMarkdown markdown={content} />
      </div>
    );
  }

  render() {
    const {content, hideContainer} = this.props;

    if (!content) {
      return null;
    }

    // CodeBridge does not use the teal container/header, so we just render the content.
    if (hideContainer) {
      return this.renderMarkdownContent();
    }

    return (
      <div style={styles.container}>
        <div style={styles.header}>{i18n.forTeachersOnly()}</div>
        {this.renderMarkdownContent()}
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
