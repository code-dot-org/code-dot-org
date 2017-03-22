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
  }
};

const ProjectCardGrid = React.createClass({
  propTypes: {
    projects: React.PropTypes.array,
  },

  render() {
    const { projects } = this.props;

    return  (
      <div style={styles.grid}>
        {projects.map((project, index) => (
          <div key={index} style={styles.card}>
            <ProjectCard
              projectData={project.projectData}
              currentGallery={project.currentGallery}
            />
          </div>
        ))}
      </div>
    );
  }
});

export default ProjectCardGrid;
