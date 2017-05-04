import React, {PropTypes} from 'react';
import ProjectCard from './ProjectCard';
import i18n from "@cdo/locale";

const styles = {
  grid: {
    padding: 10,
    width: 1000
  },
  card: {
    display: "inline-block",
    padding: 10
  },
  labHeading: {
    textAlign: "left",
    fontSize: 24,
    color: "#5b6770",
    marginLeft: 10,
    marginRight: 65,
    borderBottom: "1px solid #bbbbbb",
    paddingBottom: 10,
    paddingTop: 40
  }
};

const projectDataPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  studentName: PropTypes.string,
  studentAge: PropTypes.number,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
  publishedToPublic: PropTypes.bool.isRequired,
  publishedToClass: PropTypes.bool.isRequired,
});

const projectPropType = PropTypes.shape({
  projectData: projectDataPropType.isRequired,
  currentGallery: PropTypes.string.isRequired,
});

const ProjectCardGrid = React.createClass({
  propTypes: {
    projectLists: PropTypes.shape({
      applab: PropTypes.arrayOf(projectPropType),
      gamelab: PropTypes.arrayOf(projectPropType),
      playlab: PropTypes.arrayOf(projectPropType),
      artist: PropTypes.arrayOf(projectPropType),
    }).isRequired,
    galleryType: React.PropTypes.oneOf(['personal', 'class', 'public']).isRequired
  },

  render() {
    const { projectLists, galleryType } = this.props;

    return (
      <div style={styles.grid}>
        <h2 style={styles.labHeading}> {i18n.projectTypeApplab()} </h2>
        {projectLists.applab && projectLists.applab.slice(0,4).map((project, index) => (
          <div key={index} style={styles.card}>
            <ProjectCard
              projectData={project.projectData}
              currentGallery={galleryType}
            />
          </div>
        ))}
        <h2 style={styles.labHeading}> {i18n.projectTypeGamelab()} </h2>
        {projectLists.gamelab && projectLists.gamelab.slice(0,4).map((project, index) => (
          <div key={index} style={styles.card}>
            <ProjectCard
              projectData={project.projectData}
              currentGallery={galleryType}
            />
          </div>
        ))}
        <h2 style={styles.labHeading}> {i18n.projectTypeArtist()} </h2>
        {projectLists.artist && projectLists.artist.slice(0,4).map((project, index) => (
          <div key={index} style={styles.card}>
            <ProjectCard
              projectData={project.projectData}
              currentGallery={galleryType}
            />
          </div>
        ))}
        <h2 style={styles.labHeading}> {i18n.projectTypePlaylab()} </h2>
        {projectLists.playlab && projectLists.playlab.slice(0,4).map((project, index) => (
          <div key={index} style={styles.card}>
            <ProjectCard
              projectData={project.projectData}
              currentGallery={galleryType}
            />
          </div>
        ))}
      </div>
    );
  }
});

export default ProjectCardGrid;
