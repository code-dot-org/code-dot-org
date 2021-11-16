import PropTypes from 'prop-types';
import React from 'react';
import NewProjectButtons from './NewProjectButtons';
import i18n from '@cdo/locale';
import Button from '../Button';
import color from '../../util/color';

export default class StartNewProject extends React.Component {
  static propTypes = {
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    canViewFullList: PropTypes.bool,
    canViewAdvancedTools: PropTypes.bool
  };

  static defaultProps = {
    canViewAdvancedTools: true
  };

  state = {
    showFullList: false
  };

  toggleShowFullList = () => {
    this.setState({showFullList: !this.state.showFullList});
  };

  render() {
    const {canViewAdvancedTools, canViewFullList} = this.props;
    const {showFullList} = this.state;

    const GAMES_AND_EVENTS = [
      'spritelab',
      'dance',
      'poetry',
      'flappy',
      'starwarsblocks',
      'starwars',
      'bounce',
      'sports',
      'basketball'
    ];

    const DEFAULT_PROJECT_TYPES_ADVANCED = [
      'spritelab',
      'artist',
      'applab',
      'gamelab'
    ];

    const DEFAULT_PROJECT_TYPES_BASIC = [
      'spritelab',
      'artist',
      'minecraft_designer',
      'dance',
      'poetry'
    ];

    const defaultProjectTypes = canViewAdvancedTools
      ? DEFAULT_PROJECT_TYPES_ADVANCED
      : DEFAULT_PROJECT_TYPES_BASIC;

    return (
      <div>
        <div style={styles.headingStartNew}>{i18n.projectStartNew()}</div>
        <NewProjectButtons projectTypes={defaultProjectTypes} />

        {canViewFullList && (
          <Button
            __useDeprecatedTag
            id="uitest-view-full-list"
            onClick={this.toggleShowFullList}
            color={Button.ButtonColor.gray}
            icon={showFullList ? 'caret-up' : 'caret-down'}
            text={showFullList ? i18n.hideFullList() : i18n.viewFullList()}
            style={styles.button}
          />
        )}

        <div style={{clear: 'both'}} />

        {showFullList && (
          <div>
            <NewProjectButtons
              description={i18n.projectGroupPlaylab()}
              projectTypes={['playlab', 'infinity', 'gumball', 'iceage']}
            />
            <NewProjectButtons
              description={i18n.projectGroupEvents()}
              projectTypes={GAMES_AND_EVENTS}
            />
            <NewProjectButtons
              description={i18n.projectGroupArtist()}
              projectTypes={['artist', 'frozen']}
            />
            <NewProjectButtons
              description={i18n.projectGroupMinecraft()}
              projectTypes={[
                'minecraft_aquatic',
                'minecraft_hero',
                'minecraft_designer',
                'minecraft_adventurer'
              ]}
            />
            {canViewAdvancedTools && (
              <NewProjectButtons
                description={i18n.projectGroupAdvancedTools()}
                projectTypes={['applab', 'gamelab', 'weblab']}
              />
            )}
            <NewProjectButtons
              description={i18n.projectGroupPreReader()}
              projectTypes={['playlab_k1', 'artist_k1']}
            />
            <NewProjectButtons
              description={i18n.projectGroupMath()}
              projectTypes={['calc', 'eval']}
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
    marginRight: 1
  },
  headingStartNew: {
    paddingRight: 10,
    paddingBottom: 10,
    fontSize: 16,
    fontFamily: '"Gotham 4r"',
    color: color.charcoal,
    marginBottom: -10
  },
  spacer: {
    paddingTop: 10,
    clear: 'both',
    width: '100%'
  }
};
