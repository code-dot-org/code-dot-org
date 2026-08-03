import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

// Information about a lesson group
export default class LessonGroupInfo extends Component {
  static propTypes = {
    description: PropTypes.string,
    bigQuestions: PropTypes.string,
  };

  renderSubtitle(text) {
    return (
      <Typography
        variant="h5"
        component="h4"
        sx={{color: 'var(--text-brand-teal-primary)'}}
      >
        {text}
      </Typography>
    );
  }

  renderBody(markdown) {
    return (
      <Typography
        variant="body3"
        component="div"
        sx={{color: 'var(--text-neutral-primary)'}}
      >
        <SafeMarkdown openExternalLinksInNewTab={true} markdown={markdown} />
      </Typography>
    );
  }

  render() {
    return (
      <div>
        {this.props.description && (
          <div>
            {this.renderSubtitle(i18n.description())}
            {this.renderBody(this.props.description)}
          </div>
        )}
        {this.props.bigQuestions && (
          <div>
            {this.renderSubtitle(i18n.bigQuestions())}
            {this.renderBody(this.props.bigQuestions)}
          </div>
        )}
      </div>
    );
  }
}
