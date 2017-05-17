import React, {PropTypes} from 'react';
import ProjectCard from './ProjectCard';
import {projectPropType} from './projectConstants';
import color from "../../util/color";
import ProgressButton from "../progress/ProgressButton";

const styles = {
  grid: {
    padding: 10,
    width: 1000
  },
  card: {
    display: "inline-block",
    paddingTop: 10,
    paddingBottom: 20,
    paddingRight: 18,
    paddingLeft: 10
  },
  labHeading: {
    textAlign: "left",
    fontSize: 24,
    color: color.charcoal,
    marginLeft: 10,
    marginBottom: 0,
    paddingBottom: 0,
    paddingTop: 40,
    float: 'left'
  },
  viewMore: {
    color: color.light_teal,
    float: 'right',
    marginTop: 75,
    cursor: 'pointer',
    marginRight: 22,
    fontFamily: '"Gotham 5r", sans-serif'
  }
};

const NUM_PROJECTS_TO_ADD = 12;

const ProjectAppTypeArea = React.createClass({
  propTypes: {
    labName: PropTypes.string.isRequired,
    labViewMoreString: PropTypes.string.isRequired,
    projectList: PropTypes.arrayOf(projectPropType),
    numProjectsToShow: PropTypes.number.isRequired,
    galleryType: PropTypes.oneOf(['personal', 'class', 'public']).isRequired,
    navigateFunction: PropTypes.func.isRequired,

    // Only show one project type.
    isDetailView: PropTypes.bool.isRequired,
  },

  getInitialState() {
    return {
      maxNumProjects: this.props.projectList ? this.props.projectList.length : 0,
      numProjects: this.props.numProjectsToShow
    };
  },

  viewMore() {
    const appName = this.props.labName.toLowerCase().replace(' ', '');
    this.props.navigateFunction(appName);
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

  loadMore() {
    this.setState({numProjects: this.state.numProjects + NUM_PROJECTS_TO_ADD});
  },

  renderViewMoreButtons() {
    return (
      <div style={{float: "right", marginRight: 22}}>
        {
          this.state.maxNumProjects >= this.state.numProjects &&
          <ProgressButton
            onClick={this.loadMore}
            color={ProgressButton.ButtonColor.gray}
            icon="plus-circle"
            text="View more"
            style={{marginRight: 20}}
          />
        }
        <ProgressButton
          href="#gallery-switcher"
          color={ProgressButton.ButtonColor.gray}
          icon="chevron-circle-up"
          text="Back to top"
        />
      </div>
    );
  },

  render() {
    return (
      <div style={styles.grid}>
        <h2 style={styles.labHeading}> {this.props.labName} </h2>
        <span style={styles.viewMore} onClick={this.viewMore}>
          {this.props.isDetailView && <i className="fa fa-angle-left" style={{paddingRight: 6}} ></i>}
          {this.props.labViewMoreString}
          {!this.props.isDetailView && <i className="fa fa-angle-right" style={{paddingLeft: 6}} ></i>}
        </span>
        <div style={{clear: 'both'}}></div>
        {this.renderProjectCardList(this.props.projectList, this.state.numProjects)}
        {this.props.isDetailView && this.renderViewMoreButtons()}
      </div>
    );
  }
});

export default ProjectAppTypeArea;
