import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import GlobalEditionWrapper from '@cdo/apps/templates/GlobalEditionWrapper';
import i18n from '@cdo/locale';

import color from '../../util/color';

import NewProjectButtons from './NewProjectButtons';

const BLOCKS_PROJECT_TYPES = ['spritelab', 'artist', 'music'];

const BEYOND_BLOCKS_PROJECT_TYPES = [
  'gamelab',
  'applab',
  'pythonlab',
  'weblab2',
];

const OPEN_ENDED_PROJECT_TYPES = [
  'music_dance_ai',
  'music',
  'spritelab',
  'game_design',
  'dance',
  'poetry_hoc',
];

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
  'starwars',
  'basketball',
];

const PLAYLAB_PROJECT_TYPES = ['playlab', 'infinity', 'gumball', 'iceage'];

const PREREADER_PROJECT_TYPES = ['playlab_k1', 'artist_k1'];

export class StartNewProject extends React.Component {
  static propTypes = {
    availableProjectTypes: PropTypes.arrayOf(PropTypes.string),
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

  cleanProjectTypes = projectTypes => {
    const {availableProjectTypes} = this.props;

    if (availableProjectTypes) {
      projectTypes = projectTypes.filter(projectType =>
        availableProjectTypes.includes(projectType)
      );
    }

    return projectTypes;
  };

  getFullListProjectButtonsData = () => {
    const projectButtonsData = [];

    const openEndedProjectTypes = this.cleanProjectTypes(
      OPEN_ENDED_PROJECT_TYPES
    );
    if (openEndedProjectTypes.length) {
      projectButtonsData.push({
        description: i18n.projectGroupOpenEnded(),
        projectTypes: openEndedProjectTypes,
      });
    }

    const drawingProjectTypes = this.cleanProjectTypes(DRAWING_PROJECT_TYPES);
    if (drawingProjectTypes.length) {
      projectButtonsData.push({
        description: i18n.projectGroupArtist(),
        projectTypes: drawingProjectTypes,
      });
    }

    const minecraftProjectTypes = this.cleanProjectTypes(
      MINECRAFT_PROJECT_TYPES
    );
    if (minecraftProjectTypes.length) {
      projectButtonsData.push({
        description: i18n.projectGroupMinecraft(),
        projectTypes: minecraftProjectTypes,
      });
    }

    const gamesAndEventsProjectTypes = this.cleanProjectTypes(
      GAMES_AND_EVENTS_PROJECT_TYPES
    );
    if (gamesAndEventsProjectTypes.length) {
      projectButtonsData.push({
        description: i18n.projectGroupEvents(),
        projectTypes: gamesAndEventsProjectTypes,
      });
    }

    const playLabProjectTypes = this.cleanProjectTypes(PLAYLAB_PROJECT_TYPES);
    if (playLabProjectTypes.length) {
      projectButtonsData.push({
        description: i18n.projectGroupPlaylab(),
        projectTypes: playLabProjectTypes,
      });
    }

    const preReaderProjectTypes = this.cleanProjectTypes(
      PREREADER_PROJECT_TYPES
    );
    if (preReaderProjectTypes.length) {
      projectButtonsData.push({
        description: i18n.projectGroupPreReader(),
        projectTypes: preReaderProjectTypes,
      });
    }

    return projectButtonsData;
  };

  render() {
    const {canViewAdvancedTools, canViewFullList} = this.props;
    const {showFullList} = this.state;

    const blocksProjectTypes = this.cleanProjectTypes(BLOCKS_PROJECT_TYPES);
    const beyondBlocksProjectTypes = canViewAdvancedTools
      ? this.cleanProjectTypes(BEYOND_BLOCKS_PROJECT_TYPES)
      : [];
    const fullListProjectButtonsData = canViewFullList
      ? this.getFullListProjectButtonsData()
      : [];

    const showAboveFold =
      blocksProjectTypes.length || beyondBlocksProjectTypes.length;

    return (
      <div>
        {!!showAboveFold && (
          <>
            <h4 className="new-project-heading" style={styles.headingStartNew}>
              {i18n.projectCreateNew()}
            </h4>
            {!!blocksProjectTypes.length && (
              <NewProjectButtons
                description={i18n.projectGroupBlocks()}
                projectTypes={blocksProjectTypes}
              />
            )}
            {!!beyondBlocksProjectTypes.length && (
              <NewProjectButtons
                description={i18n.projectGroupAdvancedTools()}
                projectTypes={beyondBlocksProjectTypes}
              />
            )}
          </>
        )}

        {!!fullListProjectButtonsData.length && (
          <>
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <MuiButton
                id="uitest-view-full-list"
                onClick={this.toggleShowFullList}
                variant="outlined"
                color="tertiary"
                size="small"
                style={styles.dividerButton}
                startIcon={
                  <i
                    className={`fa fa-chevron-${showFullList ? 'up' : 'down'}`}
                  />
                }
              >
                {showFullList ? i18n.hideFullList() : i18n.viewFullList()}
              </MuiButton>
              <div style={styles.dividerLine} />
            </div>

            {showFullList && (
              <div id="full-list-projects">
                {fullListProjectButtonsData.map(projectData => (
                  <NewProjectButtons
                    key={projectData.description}
                    description={projectData.description}
                    projectTypes={projectData.projectTypes}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div style={styles.spacer} />
      </div>
    );
  }
}

const styles = {
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '32px 0 8px',
  },
  dividerLine: {
    flex: 1,
    borderTop: '1px solid ' + color.neutral_dark20,
  },
  dividerButton: {
    margin: '0 16px',
    flexShrink: 0,
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

/**
 * This is a version of the new project selection that is overridable by a region
 * configuration.
 *
 * This is done via a configuration in, for instance, /config/global_editions/fa.yml
 * via a paths rule such as:
 *
 * ```
 * pages:
 *   # All pages
 *   - path: /
 *     components:
 *       StartNewProject:
 *         availableProjectTypes: ['artist', 'playlab']
 * ```
 */
const RegionalStartNewProject = props => (
  <GlobalEditionWrapper
    component={StartNewProject}
    componentId="StartNewProject"
    props={props}
  />
);

export default RegionalStartNewProject;
