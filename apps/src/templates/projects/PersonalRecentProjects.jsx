import React, {PropTypes} from 'react';
import ProjectCard from './ProjectCard.jsx';
import {personalProjectDataPropType} from './projectConstants';
import color from "../../util/color";
import i18n from "@cdo/locale";

const styles = {
  grid: {
    width: 1000
  },
  link: {
    color: color.light_teal,
    paddingLeft: 30
  },
  card: {
    display: "inline-block",
    paddingTop: 10,
    paddingBottom: 20,
    paddingRight: 18,
    paddingLeft: 10
  }
};

const ProjectCardGrid = React.createClass({
  propTypes: {
    projectList: PropTypes.arrayOf(personalProjectDataPropType).isRequired
  },

  renderProjectCardList(projectList) {
    return  (
      <div>
        {
          projectList && projectList.slice(0,4).map((project, index) => (
            <div key={index} style={styles.card}>
              <ProjectCard
                projectData={project}
                currentGallery={'personal'}
                hideActions={true}
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
        <h3>{i18n.projectsContinueWorking()}</h3>
        {this.renderProjectCardList(this.props.projectList)}
      </div>
    );
  }
});

export default ProjectCardGrid;
