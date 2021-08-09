import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProjectAppTypeArea from './ProjectAppTypeArea.jsx';
import {projectPropType, Galleries} from './projectConstants';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import color from '../../util/color';
import styleConstants from '../../styleConstants';
import experiments from '@cdo/apps/util/experiments';

const NUM_PROJECTS_ON_PREVIEW = 4;
const NUM_PROJECTS_IN_APP_VIEW = 12;

class ProjectCardGrid extends Component {
  constructor() {
    super();
    this.state = {
      showAll: true,
      showApp: ''
    };
  }

  static propTypes = {
    projectLists: PropTypes.shape({
      applab: PropTypes.arrayOf(projectPropType),
      spritelab: PropTypes.arrayOf(projectPropType),
      gamelab: PropTypes.arrayOf(projectPropType),
      playlab: PropTypes.arrayOf(projectPropType),
      artist: PropTypes.arrayOf(projectPropType),
      minecraft: PropTypes.arrayOf(projectPropType),
      bounce: PropTypes.arrayOf(projectPropType),
      events: PropTypes.arrayOf(projectPropType),
      k1: PropTypes.arrayOf(projectPropType),
      dance: PropTypes.arrayOf(projectPropType),
      special_topic: PropTypes.arrayOf(projectPropType)
    }).isRequired,
    galleryType: PropTypes.oneOf(['personal', 'public']).isRequired,
    selectedGallery: PropTypes.string.isRequired,
    // Controls hiding/showing view more links for App Lab and Game Lab.
    limitedGallery: PropTypes.bool
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.selectedGallery !== this.props.selectedGallery &&
      nextProps.selectedGallery === Galleries.PUBLIC
    ) {
      this.setState({showAll: true, showApp: ''});
    }
  }

  onSelectApp = appType => {
    const projectGridDiv = document.getElementById('projectCardGrid');
    if (projectGridDiv) {
      const projectGridRect = projectGridDiv.getBoundingClientRect();
      window.scrollTo(
        projectGridRect.left + window.pageXOffset,
        projectGridRect.top + window.pageYOffset
      );
    }
    this.setState({showAll: false, showApp: appType});
  };

  viewAllProjects = () => {
    this.setState({showAll: true, showApp: ''});
  };

  render() {
    const {projectLists} = this.props;
    const showSpecialTopic = experiments.isEnabled(experiments.SPECIAL_TOPIC);
    const numProjects = this.state.showAll
      ? NUM_PROJECTS_ON_PREVIEW
      : NUM_PROJECTS_IN_APP_VIEW;

    return (
      <div id="projectCardGrid" style={styles.grid}>
        {this.state.showAll && (
          <div>
            {showSpecialTopic && (
              <ProjectAppTypeArea
                labKey="special_topic"
                labName={i18n.projectTypeSpecialTopic()}
                labViewMoreString={i18n.projectTypeSpecialTopicViewMore()}
                projectList={projectLists.special_topic}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.onSelectApp}
                isDetailView={false}
                hideWithoutThumbnails={true}
              />
            )}
            <ProjectAppTypeArea
              labKey="dance"
              labName={i18n.projectTypeDance()}
              labViewMoreString={i18n.projectTypeDanceViewMore()}
              projectList={projectLists.dance}
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
              hideViewMoreLink={this.props.limitedGallery}
              projectList={projectLists.gamelab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideWithoutThumbnails={true}
            />
            <ProjectAppTypeArea
              labKey="applab"
              labName={i18n.projectTypeApplab()}
              labViewMoreString={i18n.projectTypeApplabViewMore()}
              hideViewMoreLink={this.props.limitedGallery}
              projectList={projectLists.applab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideWithoutThumbnails={true}
            />
            <ProjectAppTypeArea
              labKey="spritelab"
              labName={i18n.projectTypeSpriteLab()}
              labViewMoreString={i18n.projectTypeSpriteLabViewMore()}
              projectList={projectLists.spritelab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideWithoutThumbnails={true}
            />
            <ProjectAppTypeArea
              labKey="playlab"
              labName={i18n.projectGroupPlaylab()}
              labViewMoreString={i18n.projectGroupPlaylabViewMore()}
              projectList={projectLists.playlab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideWithoutThumbnails={true}
            />
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
            <ProjectAppTypeArea
              labKey="artist"
              labName={i18n.projectGroupArtist()}
              labViewMoreString={i18n.projectGroupArtistViewMore()}
              projectList={projectLists.artist}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideWithoutThumbnails={true}
            />
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
          </div>
        )}

        {!this.state.showAll && (
          <div>
            {this.state.showApp === 'special_topic' && showSpecialTopic && (
              <ProjectAppTypeArea
                labKey="special_topic"
                labName={i18n.projectTypeSpecialTopic()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.special_topic}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={false}
              />
            )}
            {this.state.showApp === 'dance' && (
              <ProjectAppTypeArea
                labKey="dance"
                labName={i18n.projectTypeDance()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.dance}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            )}
            {this.state.showApp === 'gamelab' && (
              <ProjectAppTypeArea
                labKey="gamelab"
                labName={i18n.projectTypeAllProjectsGamelab()}
                labViewMoreString={i18n.projectsViewAll()}
                hideViewMoreLink={this.props.limitedGallery}
                projectList={projectLists.gamelab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            )}
            {this.state.showApp === 'applab' && (
              <ProjectAppTypeArea
                labKey="applab"
                labName={i18n.projectTypeAllProjectsApplab()}
                labViewMoreString={i18n.projectsViewAll()}
                hideViewMoreLink={this.props.limitedGallery}
                projectList={projectLists.applab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            )}
            {this.state.showApp === 'spritelab' && (
              <ProjectAppTypeArea
                labKey="spritelab"
                labName={i18n.projectTypeSpriteLab()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.spritelab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            )}
            {this.state.showApp === 'playlab' && (
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
            )}
            {this.state.showApp === 'events' && (
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
            )}
            {this.state.showApp === 'artist' && (
              <ProjectAppTypeArea
                labKey="artist"
                labName={i18n.projectGroupArtistAllProjects()}
                labViewMoreString={i18n.projectsViewAll()}
                projectList={projectLists.artist}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
                isDetailView={true}
              />
            )}
            {this.state.showApp === 'minecraft' && (
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
            )}
            {this.state.showApp === 'k1' && (
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
            )}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  grid: {
    width: styleConstants['content-width']
  },
  link: {
    color: color.light_teal
  }
};

export default connect(state => ({
  selectedGallery: state.projects.selectedGallery
}))(ProjectCardGrid);
