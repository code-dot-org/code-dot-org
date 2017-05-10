import React, {PropTypes} from 'react';
import ProjectAppTypeArea from './ProjectAppTypeArea.jsx';
import {projectPropType} from './projectConstants';
import i18n from "@cdo/locale";

const styles = {
  grid: {
    padding: 10,
    width: 1000
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
    galleryType: PropTypes.oneOf(['personal', 'class', 'public']).isRequired
  },

  render() {
    const { projectLists } = this.props;

    return (
      <div style={styles.grid}>
        <ProjectAppTypeArea
          labName={i18n.projectTypeApplab()}
          labViewMoreString="View more App Lab projects"
          projectList={projectLists.applab}
          numProjectsToShow={4}
          galleryType={this.props.galleryType}
        />

        <ProjectAppTypeArea
          labName={i18n.projectTypeGamelab()}
          labViewMoreString="View more Game Lab projects"
          projectList={projectLists.gamelab}
          numProjectsToShow={4}
          galleryType={this.props.galleryType}
        />

        <ProjectAppTypeArea
          labName={i18n.projectTypeArtist()}
          labViewMoreString="View more Artist projects"
          projectList={projectLists.gamelab}
          numProjectsToShow={4}
          galleryType={this.props.galleryType}
        />

        <ProjectAppTypeArea
          labName={i18n.projectTypePlaylab()}
          labViewMoreString="View more Play Lab projects"
          projectList={projectLists.playlab}
          numProjectsToShow={4}
          galleryType={this.props.galleryType}
        />
      </div>
    );
  }
});

export default ProjectCardGrid;
