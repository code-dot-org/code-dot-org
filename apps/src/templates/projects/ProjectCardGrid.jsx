import React, {PropTypes} from 'react';
import ProjectAppTypeArea from './ProjectAppTypeArea.jsx';
import {projectPropType, Galleries} from './projectConstants';
import i18n from "@cdo/locale";
import {connect} from 'react-redux';
import color from "../../util/color";
import styleConstants from '../../styleConstants';

const NUM_PROJECTS_ON_PREVIEW = 4;
const NUM_PROJECTS_IN_APP_VIEW = 12;

const styles = {
  grid: {
    width: styleConstants['content-width']
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
              labName={i18n.projectTypeGamelab()}
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
          </div>
        }

      </div>
    );
  }
});

export default connect(state => ({
  selectedGallery: state.projects.selectedGallery
}))(ProjectCardGrid);
