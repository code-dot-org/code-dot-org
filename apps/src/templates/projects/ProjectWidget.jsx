import React, {PropTypes} from 'react';
import PersonalRecentProjects from './PersonalRecentProjects.jsx';
import NewProjectButtons from './NewProjectButtons.jsx';
import ContentContainer from '../ContentContainer.jsx';
import i18n from "@cdo/locale";
import _ from 'lodash';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from "../Button";
import color from "../../util/color";
import {valueOr} from '../../utils';

const styles = {
  button: {
    float: 'right',
    marginTop: 10,
  },
  headingStartNew: {
    paddingRight: 10,
    paddingBottom: 10,
    fontSize: 16,
    fontFamily: '"Gotham 4r"',
    color: color.charcoal,
    marginBottom: -20
  }
};

class ProjectWidget extends React.Component {
  static propTypes = {
    projectList: PropTypes.array.isRequired,
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    isLoading: PropTypes.bool,
    isRtl: PropTypes.bool,
    canViewFullList: PropTypes.bool,
    canViewAdvancedTools: PropTypes.bool, // Default: true
  };

  state = {
    showFullList: false,
  };

  toggleShowFullList = () => {
    this.setState({showFullList: !this.state.showFullList});
  };

  render() {
    const convertedProjects = convertChannelsToProjectData(this.props.projectList);
    const { canViewFullList, isRtl } = this.props;
    const canViewAdvancedTools = valueOr(this.props.canViewAdvancedTools, true);
    const { showFullList } = this.state;

    return (
      <ContentContainer
        heading={i18n.projects()}
        linkText={i18n.projectsViewProjectGallery()}
        link="/projects"
        isRtl={isRtl}
      >
        {this.props.isLoading &&
          <div style={{height: 280, textAlign: 'center'}}>
            <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>
          </div>
        }
        {convertedProjects.length > 0 &&
          <PersonalRecentProjects
            projectList={convertedProjects}
            isRtl={isRtl}
          />
        }
        <div style={styles.headingStartNew}>{i18n.projectStartNew()}</div>
        <NewProjectButtons
          projectTypes={this.props.projectTypes}
          isRtl={isRtl}
          canViewAdvancedTools={canViewAdvancedTools}
        />

        {canViewFullList &&
          <Button
            onClick={this.toggleShowFullList}
            color={Button.ButtonColor.gray}
            icon={showFullList ? "caret-up" : "caret-down"}
            text={showFullList ? i18n.hideFullList() : i18n.viewFullList()}
            style={styles.button}
          />
        }

        <div style={{clear: 'both'}}/>

        {showFullList &&
          <div>
            <NewProjectButtons
              description={i18n.projectGroupPlaylab()}
              projectTypes={['playlab', 'infinity', 'gumball', 'iceage']}
            />
            <NewProjectButtons
              description={i18n.projectGroupEvents()}
              projectTypes={['flappy', 'starwarsblocks', 'starwars', 'bounce', 'sports', 'basketball']}
            />
            <NewProjectButtons
              description={i18n.projectGroupArtist()}
              projectTypes={['artist', 'frozen']}
            />
            <NewProjectButtons
              description={i18n.projectGroupMinecraft()}
              projectTypes={['minecraft_designer', 'minecraft_adventurer']}
            />
            {canViewAdvancedTools &&
              <NewProjectButtons
                description={i18n.projectGroupAdvancedTools()}
                projectTypes={['applab', 'gamelab', 'weblab']}
              />
            }
            <NewProjectButtons
              description={i18n.projectGroupPreReader()}
              projectTypes={['playlab_k1', 'artist_k1']}
            />
            <NewProjectButtons
              description={i18n.projectGroupMath()}
              projectTypes={['calc', 'eval']}
            />
          </div>
        }
      </ContentContainer>
    );
  }
}

// The project widget uses the channels API to populate the personal projects
// and the data needs to be converted to match the format of the project cards
// before passing it to PersonalRecentProjects.
const convertChannelsToProjectData = function (projects) {
  // Sort by most recently updated.
  let projectLists = _.sortBy(projects, 'updatedAt').reverse();

  // Get the ones that aren't hidden, and have a type and id.
  projectLists = projectLists.filter(project => !project.hidden && project.id && project.projectType);
  const numProjects = Math.min(4, projectLists.length);
  return _.range(numProjects).map(i => (
    {
      name: projectLists[i].name,
      channel: projectLists[i].id,
      thumbnailUrl: projectLists[i].thumbnailUrl,
      type: projectLists[i].projectType,
      updatedAt: projectLists[i].updatedAt
    }
  ));
};

export default ProjectWidget;
