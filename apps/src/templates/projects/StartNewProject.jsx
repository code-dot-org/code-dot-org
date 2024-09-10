import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import i18n from '@cdo/locale';

import Button from '../../legacySharedComponents/Button';
import color from '../../util/color';

import NewProjectButtons from './NewProjectButtons';

export default class StartNewProject extends React.Component {
  static propTypes = {
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    canViewFullList: PropTypes.bool,
    canViewAdvancedTools: PropTypes.bool,
  };

  static defaultProps = {
    canViewAdvancedTools: true,
  };

  state = {
    showFullList: false,
  };

  toggleShowFullList = () => {
    this.setState({showFullList: !this.state.showFullList});
  };

  render() {
    const {canViewAdvancedTools, canViewFullList} = this.props;
    const {showFullList} = this.state;

    const DEFAULT_PROJECT_TYPES_ADVANCED = [
      'spritelab',
      'artist',
      'applab',
      'gamelab',
    ];

    const DEFAULT_PROJECT_TYPES_BASIC = [
      'spritelab',
      'artist',
      'dance',
      'playlab',
    ];

    const defaultProjectTypes = canViewAdvancedTools
      ? DEFAULT_PROJECT_TYPES_ADVANCED
      : DEFAULT_PROJECT_TYPES_BASIC;

    const OPEN_ENDED_PROJECT_TYPES = ['spritelab', 'dance', 'poetry', 'music'];

    const DRAWING_PROJECT_TYPES = ['artist', 'frozen'];

    const MINECRAFT_PROJECT_TYPES = [
      'minecraft_adventurer',
      'minecraft_designer',
      'minecraft_hero',
      'minecraft_aquatic',
    ];

    const GAMES_AND_EVENTS_PROJECT_TYPES = [
      'flappy',
      'starwarsblocks',
      'bounce',
      'sports',
      'basketball',
    ];

    const PLAYLAB_PROJECT_TYPES = ['playlab', 'infinity', 'gumball', 'iceage'];

    const ADVANCED_PROJECT_TYPES = ['applab', 'gamelab', 'weblab', 'starwars'];

    const PREREADER_PROJECT_TYPES = ['playlab_k1', 'artist_k1'];

    return (
      <div>
        <h4 className="new-project-heading" style={styles.headingStartNew}>
          {i18n.projectStartNew()}
        </h4>
        <NewProjectButtons projectTypes={defaultProjectTypes} />

        {canViewFullList && (
          <Button
            id="uitest-view-full-list"
            onClick={this.toggleShowFullList}
            color={Button.ButtonColor.neutralDark}
            icon={showFullList ? 'caret-up' : 'caret-down'}
            text={showFullList ? i18n.hideFullList() : i18n.viewFullList()}
            style={styles.button}
          />
        )}

        <div style={{clear: 'both'}} />

        {showFullList && (
          <div>
            <NewProjectButtons
              description={i18n.projectGroupOpenEnded()}
              projectTypes={OPEN_ENDED_PROJECT_TYPES}
            />
            <NewProjectButtons
              description={i18n.projectGroupArtist()}
              projectTypes={DRAWING_PROJECT_TYPES}
            />
            <NewProjectButtons
              description={i18n.projectGroupMinecraft()}
              projectTypes={MINECRAFT_PROJECT_TYPES}
            />
            <NewProjectButtons
              description={i18n.projectGroupEvents()}
              projectTypes={GAMES_AND_EVENTS_PROJECT_TYPES}
            />
            {canViewAdvancedTools && (
              <NewProjectButtons
                description={i18n.projectGroupAdvancedTools()}
                projectTypes={ADVANCED_PROJECT_TYPES}
              />
            )}
            <NewProjectButtons
              description={i18n.projectGroupPlaylab()}
              projectTypes={PLAYLAB_PROJECT_TYPES}
            />
            <NewProjectButtons
              description={i18n.projectGroupPreReader()}
              projectTypes={PREREADER_PROJECT_TYPES}
            />
          </div>
        )}
        <div style={styles.spacer} />
      </div>
    );
  }
}

const styles = {
  button: {
    float: 'right',
    margin: '0 1px 0 0',
    padding: '0 16px',
  },
  headingStartNew: {
    paddingRight: 10,
    paddingBottom: 10,
    fontSize: 16,
    ...fontConstants['main-font-regular'],
    color: color.neutral_dark,
    marginBottom: -10,
  },
  spacer: {
    paddingTop: 10,
    clear: 'both',
    width: '100%',
  },
};
