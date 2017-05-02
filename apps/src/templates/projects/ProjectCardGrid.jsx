import React from 'react';
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

const ProjectCardGrid = React.createClass({
  propTypes: {
    projects: React.PropTypes.array.isRequired,
    galleryType: React.PropTypes.oneOf(['personal', 'class', 'public']).isRequired
  },

// Most recently edited projects should display 1st. This might not be needed dependent on whether the projects returned from the query are already sorted by recency or not. ****ASK DAVE****
  sortByDate(projects) {

    let sortedProjects = projects.sort((project1, project2) =>
    new Date(project2.projectData.updatedAt) - new Date(project1.projectData.updatedAt));

    return sortedProjects;
  },

  groupByType(projects) {
    let projectLists = {};

    projects.forEach(project => {
      const type = project.projectData.type;
      projectLists[type] = projectLists[type] || [];
      projectLists[type].push(project);
    });

    return projectLists;
  },

  render() {
    const { projects, galleryType } = this.props;

    if (galleryType === 'public') {
      return (
        <div style={styles.grid}>
          <h2 style={styles.labHeading}> {i18n.projectTypeApplab()} </h2>
          {this.groupByType(projects).applab.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> {i18n.projectTypeGamelab()} </h2>
          {this.groupByType(projects).gamelab.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> {i18n.projectTypeArtist()} </h2>
          {this.groupByType(projects).artist.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> {i18n.projectTypePlaylab()} </h2>
          {this.groupByType(projects).playlab.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> {i18n.projectTypeWeblab()} </h2>
          {this.groupByType(projects).weblab.slice(0,4).map((project, index) => (
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
    return (
      <div style={styles.grid}>
        {this.sortByDate(projects).map((project, index) => (
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
