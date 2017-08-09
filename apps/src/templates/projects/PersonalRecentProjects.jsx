import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
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

const ProjectCardGrid = createReactClass({
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
