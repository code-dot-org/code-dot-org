import React, {PropTypes} from 'react';
import ProjectAppTypeArea from './ProjectAppTypeArea.jsx';
import {projectPropType, Galleries} from './projectConstants';
import i18n from "@cdo/locale";
import {connect} from 'react-redux';
import color from "../../util/color";

const NUM_PROJECTS_ON_PREVIEW = 4;
const NUM_PROJECTS_IN_APP_VIEW = 12;

const styles = {
  grid: {
    padding: 10,
    width: 970
  },
  link: {
    color: color.light_teal,
    paddingLeft: 30
  }
};

const ProjectCardGrid = React.createClass({
  propTypes: {
    projectLists: PropTypes.shape({
      applab: PropTypes.arrayOf(projectPropType),
      gamelab: PropTypes.arrayOf(projectPropType),
      playlab: PropTypes.arrayOf(projectPropType),
      artist: PropTypes.arrayOf(projectPropType),
    }).isRequired,
    hasOlderProjects: PropTypes.shape({
      applab: PropTypes.bool.isRequired,
      gamelab: PropTypes.bool.isRequired,
      playlab: PropTypes.bool.isRequired,
      artist: PropTypes.bool.isRequired,
    }).isRequired,
    fetchOlderProjects: PropTypes.func.isRequired,
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

    return (
      <div style={styles.grid}>
        {(this.state.showAll) &&
          <div>
            <ProjectAppTypeArea
              labKey="playlab"
              labName={i18n.projectTypePlaylab()}
              labViewMoreString={i18n.projectTypePlaylabViewMore()}
              projectList={projectLists.playlab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
            />
            <ProjectAppTypeArea
              labKey="artist"
              labName={i18n.projectTypeArtist()}
              labViewMoreString={i18n.projectTypeArtistViewMore()}
              projectList={projectLists.artist}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
            />
            <ProjectAppTypeArea
              labKey="applab"
              labName={i18n.projectTypeApplab()}
              labViewMoreString={i18n.projectTypeApplabViewMore()}
              projectList={projectLists.applab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
            />
            <ProjectAppTypeArea
              labKey="gamelab"
              labName={i18n.projectTypeGamelabBeta()}
              labViewMoreString={i18n.projectTypeGamelabViewMore()}
              projectList={projectLists.gamelab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
            />
            <a href="/gallery" style={styles.link}>{i18n.projectsViewOldGallery()}</a>
          </div>
        }

        {(!this.state.showAll) &&
          <div>
            {this.state.showApp === 'playlab' &&
              <ProjectAppTypeArea
                labKey="playlab"
                labName={i18n.projectTypeAllProjectsPlaylab()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.playlab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
                hasOlderProjects={this.props.hasOlderProjects.playlab}
                fetchOlderProjects={this.props.fetchOlderProjects}
              />
            }
            {this.state.showApp === 'artist' &&
              <ProjectAppTypeArea
                labKey="artist"
                labName={i18n.projectTypeAllProjectsArtist()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.artist}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
                hasOlderProjects={this.props.hasOlderProjects.artist}
                fetchOlderProjects={this.props.fetchOlderProjects}
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
                hasOlderProjects={this.props.hasOlderProjects.applab}
                fetchOlderProjects={this.props.fetchOlderProjects}
              />
            }
            {this.state.showApp === 'gamelab' &&
              <ProjectAppTypeArea
                labKey="gamelab"
                labName={i18n.projectTypeAllProjectsGamelabBeta()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.gamelab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
                hasOlderProjects={this.props.hasOlderProjects.gamelab}
                fetchOlderProjects={this.props.fetchOlderProjects}
              />
            }
          </div>
        }

      </div>
    );
  }
});

export default connect(state => ({
  selectedGallery: state.selectedGallery
}))(ProjectCardGrid);
