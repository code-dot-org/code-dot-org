import PropTypes from 'prop-types';
import React from 'react';
import ProjectCardRow from './ProjectCardRow';
import {projectPropType} from './projectConstants';
import color from '../../util/color';
import styleConstants from '../../styleConstants';

export default class ProjectAppTypeArea extends React.Component {
  static propTypes = {
    labKey: PropTypes.string.isRequired,
    labName: PropTypes.string.isRequired,
    projectList: PropTypes.arrayOf(projectPropType),
    numProjectsToShow: PropTypes.number.isRequired,
    galleryType: PropTypes.oneOf(['personal', 'class', 'public']).isRequired,
    navigateFunction: PropTypes.func.isRequired,

    // Only show one project type.
    isDetailView: PropTypes.bool.isRequired,

    // Hide projects that don't have thumbnails
    hideWithoutThumbnails: PropTypes.bool,

    // from redux state
    hasOlderProjects: PropTypes.bool.isRequired,

    // from redux dispatch
    appendProjects: PropTypes.func.isRequired,
    setHasOlderProjects: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      maxNumProjects: this.props.projectList
        ? this.props.projectList.length
        : 0,
      numProjects: this.props.numProjectsToShow,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      maxNumProjects: nextProps.projectList ? nextProps.projectList.length : 0,
    });
  }

  renderProjectCardList(projectList, max) {
    let filteredList = [];
    if (projectList) {
      filteredList = this.props.hideWithoutThumbnails
        ? projectList.filter(
            project => project.projectData.thumbnailUrl !== null
          )
        : projectList;
    }
    filteredList = filteredList
      .slice(0, max)
      .map(project => project.projectData);

    return (
      <ProjectCardRow
        projects={filteredList}
        galleryType={this.props.galleryType}
        showReportAbuseHeader
      />
    );
  }

  render() {
    return (
      <div
        style={styles.grid}
        className={`ui-project-app-type-area ui-${this.props.labKey}`}
      >
        <h2 style={styles.labHeading}> {this.props.labName} </h2>
        <div style={styles.clear} />
        {this.renderProjectCardList(
          this.props.projectList,
          this.state.numProjects
        )}
      </div>
    );
  }
}

const styles = {
  grid: {
    width: styleConstants['content-width'],
  },
  labHeading: {
    textAlign: 'left',
    fontSize: 24,
    color: color.neutral_dark,
    marginBottom: 0,
    paddingBottom: 0,
    paddingTop: 0,
    float: 'left',
  },
  clear: {
    clear: 'both',
  },
};
