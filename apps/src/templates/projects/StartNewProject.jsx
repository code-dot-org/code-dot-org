import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import GlobalEditionWrapper from '@cdo/apps/templates/GlobalEditionWrapper';
import i18n from '@cdo/locale';

import Button from '../../legacySharedComponents/Button';
import color from '../../util/color';

import NewProjectButtons from './NewProjectButtons';

const DEFAULT_PROJECT_TYPES_ADVANCED = [
  'spritelab',
  'artist',
  'applab',
  'gamelab',
];

const DEFAULT_PROJECT_TYPES_BASIC = ['spritelab', 'artist', 'dance', 'playlab'];

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

    if (this.props.canViewAdvancedTools) {
      const advancedProjectTypes = this.cleanProjectTypes(
        ADVANCED_PROJECT_TYPES
      );
      if (advancedProjectTypes.length) {
        projectButtonsData.push({
          description: i18n.projectGroupAdvancedTools(),
          projectTypes: advancedProjectTypes,
        });
      }
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

    const defaultProjectTypes = this.cleanProjectTypes(
      canViewAdvancedTools
        ? DEFAULT_PROJECT_TYPES_ADVANCED
        : DEFAULT_PROJECT_TYPES_BASIC
    );
    const fullListProjectButtonsData = canViewFullList
      ? this.getFullListProjectButtonsData()
      : [];

    return (
      <div>
        {defaultProjectTypes.length && (
          <>
            <h4 className="new-project-heading" style={styles.headingStartNew}>
              {i18n.projectStartNew()}
            </h4>
            <NewProjectButtons projectTypes={defaultProjectTypes} />
          </>
        )}

        {fullListProjectButtonsData.length && (
          <>
            <Button
              id="uitest-view-full-list"
              onClick={this.toggleShowFullList}
              color={Button.ButtonColor.neutralDark}
              icon={showFullList ? 'caret-up' : 'caret-down'}
              text={showFullList ? i18n.hideFullList() : i18n.viewFullList()}
              style={styles.button}
            />

            <div style={{clear: 'both'}} />

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
