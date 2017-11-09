import React, {PropTypes} from 'react';
import ProjectAppTypeArea from './ProjectAppTypeArea.jsx';
import {projectPropType, Galleries} from './projectConstants';
import i18n from "@cdo/locale";
import {connect} from 'react-redux';
import color from "../../util/color";
import styleConstants from '../../styleConstants';
import experiments from '../../util/experiments';

const NUM_PROJECTS_ON_PREVIEW = 4;
const NUM_PROJECTS_IN_APP_VIEW = 12;

const styles = {
  grid: {
    width: styleConstants['content-width']
  },
  link: {
    color: color.light_teal
  }
};

const ProjectCardGrid = React.createClass({
  propTypes: {
    projectLists: PropTypes.shape({
      applab: PropTypes.arrayOf(projectPropType),
      gamelab: PropTypes.arrayOf(projectPropType),
      playlab: PropTypes.arrayOf(projectPropType),
      artist: PropTypes.arrayOf(projectPropType),
      minecraft: PropTypes.arrayOf(projectPropType),
      bounce: PropTypes.arrayOf(projectPropType),
      events: PropTypes.arrayOf(projectPropType),
      k1: PropTypes.arrayOf(projectPropType),
    }).isRequired,
    galleryType: PropTypes.oneOf(['personal', 'class', 'public']).isRequired,
    selectedGallery: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      showAll: true,
      showApp: ''
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedGallery !== this.props.selectedGallery && nextProps.selectedGallery === Galleries.PUBLIC) {
      this.setState({showAll: true, showApp: ''});
    }
  },

  onSelectApp(appType) {
    this.setState({showAll: false, showApp: appType});
  },

  viewAllProjects() {
    this.setState({showAll: true, showApp: ''});
  },

  render() {
    const { projectLists } = this.props;
    const numProjects = this.state.showAll ? NUM_PROJECTS_ON_PREVIEW : NUM_PROJECTS_IN_APP_VIEW;
    const showMoreProjects = experiments.isEnabled('publishMoreProjects');

    return (
      <div style={styles.grid}>
        {(this.state.showAll) &&
          <div>
            <ProjectAppTypeArea
              labKey="playlab"
              labName={showMoreProjects ? i18n.projectGroupPlaylab() : i18n.projectTypePlaylab()}
              labViewMoreString={showMoreProjects ? i18n.projectGroupPlaylabViewMore() : i18n.projectTypePlaylabViewMore()}
              projectList={projectLists.playlab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideWithoutThumbnails={true}
            />
            {showMoreProjects &&
              <ProjectAppTypeArea
                labKey="events"
                labName={i18n.projectGroupEvents()}
                labViewMoreString={i18n.projectGroupEventsViewMore()}
                projectList={projectLists.events}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.onSelectApp}
                isDetailView={false}
                hideWithoutThumbnails={true}
              />
            }
            <ProjectAppTypeArea
              labKey="artist"
              labName={showMoreProjects ? i18n.projectGroupArtist() : i18n.projectTypeArtist()}
              labViewMoreString={showMoreProjects ? i18n.projectGroupArtistViewMore() : i18n.projectTypeArtistViewMore()}
              projectList={projectLists.artist}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideWithoutThumbnails={true}
            />
            {showMoreProjects &&
              <ProjectAppTypeArea
                labKey="minecraft"
                labName={i18n.projectGroupMinecraft()}
                labViewMoreString={i18n.projectGroupMinecraftViewMore()}
                projectList={projectLists.minecraft}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.onSelectApp}
                isDetailView={false}
                hideWithoutThumbnails={true}
              />
            }
            <ProjectAppTypeArea
              labKey="applab"
              labName={i18n.projectTypeApplab()}
              labViewMoreString={i18n.projectTypeApplabViewMore()}
              projectList={projectLists.applab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideWithoutThumbnails={true}
            />
            <ProjectAppTypeArea
              labKey="gamelab"
              labName={i18n.projectTypeGamelab()}
              labViewMoreString={i18n.projectTypeGamelabViewMore()}
              projectList={projectLists.gamelab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideWithoutThumbnails={true}
            />
            {showMoreProjects &&
              <ProjectAppTypeArea
                labKey="k1"
                labName={i18n.projectGroupPreReader()}
                labViewMoreString={i18n.projectGroupPreReaderViewMore()}
                projectList={projectLists.k1}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.onSelectApp}
                isDetailView={false}
                hideWithoutThumbnails={true}
              />
            }

            <a href="/gallery" style={styles.link}>{i18n.projectsViewOldGallery()}</a>
          </div>
        }

        {(!this.state.showAll) &&
          <div>
            {this.state.showApp === 'playlab' &&
              <ProjectAppTypeArea
                labKey="playlab"
                labName={i18n.projectGroupPlaylabAllProjects()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.playlab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            }
            {this.state.showApp === 'events' &&
              <ProjectAppTypeArea
                labKey="events"
                labName={i18n.projectGroupEventsAllProjects()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.events}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            }
            {this.state.showApp === 'artist' &&
              <ProjectAppTypeArea
                labKey="artist"
                labName={showMoreProjects ? i18n.projectGroupArtistAllProjects() : i18n.projectTypeAllProjectsArtist()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.artist}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            }
            {this.state.showApp === 'minecraft' &&
              <ProjectAppTypeArea
                labKey="minecraft"
                labName={i18n.projectGroupMinecraftAllProjects()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.minecraft}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            }
            {this.state.showApp === 'applab' &&
              <ProjectAppTypeArea
                labKey="applab"
                labName={i18n.projectTypeAllProjectsApplab()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.applab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            }
            {this.state.showApp === 'gamelab' &&
              <ProjectAppTypeArea
                labKey="gamelab"
                labName={i18n.projectTypeAllProjectsGamelab()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.gamelab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            }
            {this.state.showApp === 'k1' &&
              <ProjectAppTypeArea
                labKey="k1"
                labName={i18n.projectGroupPreReaderAllProjects()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.k1}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            }
          </div>
        }

      </div>
    );
  }
});

export default connect(state => ({
  selectedGallery: state.projects.selectedGallery
}))(ProjectCardGrid);
