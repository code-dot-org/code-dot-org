import {Button, Typography} from '@mui/material';
import React from 'react';

import {levelType} from '@cdo/apps/templates/progress/progressTypes';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import SublevelCard from './SublevelCard';

import styles from './BubbleChoice.module.scss';

export default class BubbleChoice extends React.Component {
  static propTypes = {level: levelType};

  goToUrl = url => {
    navigateToHref(url + location.search);
  };

  renderButtons = () => {
    const {level} = this.props;
    const backButtonUrl = level.previous_level_url || level.script_url;
    const finishButtonUrl = level.redirect_url || level.script_url;

    return (
      <div className={styles.buttons}>
        {backButtonUrl && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => this.goToUrl(backButtonUrl)}
          >
            {i18n.back()}
          </Button>
        )}
        {finishButtonUrl && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.goToUrl(finishButtonUrl)}
          >
            {i18n.finish()}
          </Button>
        )}
      </div>
    );
  };

  render() {
    const {level} = this.props;

    return (
      <div>
        <Typography variant="h1" className={styles.displayNameHeader}>
          {level.display_name}
        </Typography>
        <SafeMarkdown markdown={level.description} />
        {this.renderButtons()}
        <Typography
          variant="h3"
          component="h2"
          className={styles.chooseActivityHeader}
        >
          {i18n.chooseActivity()}
        </Typography>
        <div className={styles.cards}>
          {level.sublevels.map(sublevel => (
            <SublevelCard
              isLessonExtra={false}
              sublevel={sublevel}
              key={sublevel.id}
            />
          ))}
        </div>
        {this.renderButtons()}
      </div>
    );
  }
}
