import React, {PropTypes} from 'react';
import ProjectCard from './ProjectCard.jsx';
import {personalProjectDataPropType} from './projectConstants';
import color from "../../util/color";
import i18n from "@cdo/locale";
import Radium from 'radium';

const styles = {
  grid: {
    width: '100%'
  },
  link: {
    color: color.light_teal,
    paddingLeft: 30
  },
  card: {
    display: "inline-block",
    paddingTop: 10,
    paddingBottom: 20,
    paddingRight: 10,
    paddingLeft: 10
  },
  cardPadding: {
    paddingRight: 18
  },
  description: {
    paddingRight: 10,
    paddingBottom: 10,
    fontSize: 16,
    fontFamily: 'Gotham 3r',
    zIndex: 2,
    color: color.charcoal,
    width: 940
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
            <div key={index} style={[styles.card, index < 3 && styles.cardPadding]}>
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
        <div style={styles.description}>{i18n.projectsContinueWorking()}</div>
        {this.renderProjectCardList(this.props.projectList)}
      </div>
    );
  }
});

export default Radium(ProjectCardGrid);
