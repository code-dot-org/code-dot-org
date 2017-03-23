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

    let sortedProjects = projects.sort((project1, project2) => new Date(project2.projectData.updatedAt) - new Date(project1.projectData.updatedAt));

    return sortedProjects;
  },

  sortByType(projects) {
    let applabProjects = [];
    let gamelabProjects = [];
    let artistProjects = [];
    let playlabProjects = [];
    let weblabProjects = [];

    projects.forEach(function (project) {
      if (project.projectData.type === 'applab') {
        applabProjects.push(project);
      }
      if (project.projectData.type === 'gamelab') {
        gamelabProjects.push(project);
      }
      if (project.projectData.type === 'artist') {
        artistProjects.push(project);
      }
      if (project.projectData.type === 'playlab') {
        playlabProjects.push(project);
      }
      if (project.projectData.type === 'weblab') {
        weblabProjects.push(project);
      }
    });

    let projectsSortedByType = {
      applabProjects,
      gamelabProjects,
      artistProjects,
      playlabProjects,
      weblabProjects
    };
    return projectsSortedByType;
  },

//write a render helper function that renders the correct projects based on gallery type

  renderSpecificGallery() {
    const { projects, galleryType } = this.props;

    if (galleryType === 'public'){

      return (
        <div style={styles.grid}>
          <h2 style={styles.labHeading}> App Lab </h2>
          {this.sortByType(projects).applabProjects.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> Game Lab </h2>
          {this.sortByType(projects).gamelabProjects.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> Artist </h2>
          {this.sortByType(projects).artistProjects.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> Play Lab </h2>
          {this.sortByType(projects).playlabProjects.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))}
          <h2 style={styles.labHeading}> Web Lab </h2>
          {this.sortByType(projects).weblabProjects.slice(0,4).map((project, index) => (
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
  },

  render() {

    return  (
      <div>
        {this.renderSpecificGallery()}
      </div>
    );
  }
});

export default ProjectCardGrid;
