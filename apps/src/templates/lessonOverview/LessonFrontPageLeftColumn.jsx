import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export default class LessonFrontPageLeftColumn extends Component {
  static propTypes = {
    overview: PropTypes.string,
    purpose: PropTypes.string
  };

  render() {
    const {overview, purpose} = this.props;
    return (
      <div>
        <h2>{i18n.overview()}</h2>
        <SafeMarkdown markdown={overview} />

        <h2>{i18n.purpose()}</h2>
        <SafeMarkdown markdown={purpose} />
      </div>
    );
  }
}
