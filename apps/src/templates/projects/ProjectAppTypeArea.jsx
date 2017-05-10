import React, {PropTypes} from 'react';
import ProjectCard from './ProjectCard';
import {projectPropType} from './projectConstants';

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
    marginRight: 50,
    paddingBottom: 10,
    paddingTop: 40,
    float: 'left'
  },
  viewMore: {
    color: '#59cad3',
    float: 'right',
    marginTop: 75,
    cursor: 'pointer'
  }
};

const ProjectAppTypeArea = React.createClass({
  propTypes: {
    labName: PropTypes.string.isRequired,
    labViewMoreString: PropTypes.string.isRequired,
    projectList: PropTypes.arrayOf(projectPropType).isRequired,
    numProjectsToShow: PropTypes.number.isRequired,
    galleryType: PropTypes.oneOf(['personal', 'class', 'public']).isRequired
  },

  renderProjectCardList(projectList, max) {
    const { galleryType } = this.props;
    return  (
      <div>
        {
          projectList && projectList.slice(0,max).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project.projectData}
                currentGallery={galleryType}
              />
            </div>
          ))
        }
      </div>
    );
  },

  render() {
    return (
      <div style={styles.grid}>
        <h2 style={styles.labHeading}> {this.props.labName} </h2>
        <span style={styles.viewMore} > {this.props.labViewMoreString} </span>
        <div style={{clear: 'both'}}></div>
        {this.renderProjectCardList(this.props.projectList, this.props.numProjectsToShow)}
      </div>
    );
  }
});

export default ProjectAppTypeArea;
