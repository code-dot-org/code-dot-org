import React from 'react';
import ProjectCard from './ProjectCard';

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
    projects: React.PropTypes.array,
    galleryType: React.PropTypes.string
  },

// Most recently edited projects should display 1st. This might not be needed dependent on whether the projects returned from the query are already sorted by recency or not. ****ASK DAVE****
  sortByDate(projects) {

    let sortedProjects = projects.sort((project1, project2) =>
    new Date(project2.projectData.updatedAt) - new Date(project1.projectData.updatedAt));

    return sortedProjects;
  },

  sortByType(projects) {
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
          <h2 style={styles.labHeading}> App Lab </h2>
          {this.sortByType(projects).applab.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> Game Lab </h2>
          {this.sortByType(projects).gamelab.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> Artist </h2>
          {this.sortByType(projects).artist.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> Play Lab </h2>
          {this.sortByType(projects).playlab.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> Web Lab </h2>
          {this.sortByType(projects).weblab.slice(0,4).map((project, index) => (
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
