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
  card: {
    display: "inline-block",
    paddingTop: 10,
    paddingBottom: 20,
    paddingRight: 0,
    paddingLeft: 0
  },
  cardPadding: {
    paddingRight: 35
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

  render() {
    return (
      <div style={styles.grid}>
        <div style={styles.description}>{i18n.projectsContinueWorking()}</div>
        <div>
          {
            this.props.projectList && this.props.projectList.slice(0,4).map((project, index) => (
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
      </div>
    );
  }
});

export default Radium(ProjectCardGrid);
