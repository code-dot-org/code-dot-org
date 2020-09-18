import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export default class LessonFrontPageRightColumn extends Component {
  static propTypes = {
    preparation: PropTypes.string
  };

  render() {
    const {preparation} = this.props;
    return (
      <div>
        <h2>{i18n.preparation()}</h2>
        <SafeMarkdown markdown={preparation} />
      </div>
    );
  }
}
