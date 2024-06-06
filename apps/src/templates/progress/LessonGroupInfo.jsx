import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

// Information about a lesson group
export default class LessonGroupInfo extends Component {
  static propTypes = {
    description: PropTypes.string,
    bigQuestions: PropTypes.string,
  };

  render() {
    return (
      <div>
        {this.props.description && (
          <div>
            <h4 style={styles.subTitle}>{i18n.description()}</h4>
            <div style={styles.description}>
              <SafeMarkdown
                openExternalLinksInNewTab={true}
                markdown={this.props.description}
              />
            </div>
          </div>
        )}
        {this.props.bigQuestions && (
          <div>
            <h4 style={styles.subTitle}>{i18n.bigQuestions()}</h4>
            <div style={styles.description}>
              <SafeMarkdown
                openExternalLinksInNewTab={true}
                markdown={this.props.bigQuestions}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  description: {
    color: color.dark_charcoal,
    ...fontConstants['main-font-regular'],
  },
  bigQuestion: {
    ...fontConstants['main-font-bold'],
  },
  subTitle: {
    color: color.teal,
  },
};
