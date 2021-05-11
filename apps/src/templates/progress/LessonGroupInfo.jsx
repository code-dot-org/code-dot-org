import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

// Information about a lesson group
export default class LessonGroupInfo extends Component {
  static propTypes = {
    description: PropTypes.string,
    bigQuestions: PropTypes.string
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
    fontFamily: '"Gotham 4r", sans-serif'
  },
  bigQuestion: {
    fontWeight: 'bolder',
    fontFamily: '"Gotham 7r", sans-serif'
  },
  subTitle: {
    color: color.teal
  }
};
