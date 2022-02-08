import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ProjectCardRow from './ProjectCardRow';
import {MAX_PROJECTS_PER_CATEGORY, projectPropType} from './projectConstants';
import color from '../../util/color';
import styleConstants from '../../styleConstants';
import Button from '../Button';
import {connect} from 'react-redux';
import {appendProjects, setHasOlderProjects} from './projectsRedux';
import i18n from '@cdo/locale';

const NUM_PROJECTS_TO_ADD = 12;

class ProjectAppTypeArea extends React.Component {
  static propTypes = {
    labKey: PropTypes.string.isRequired,
    labName: PropTypes.string.isRequired,
    labViewMoreString: PropTypes.string.isRequired,
    // Ability to hide link for Applab and Gamelab
    hideViewMoreLink: PropTypes.bool,
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
    setHasOlderProjects: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      maxNumProjects: this.props.projectList
        ? this.props.projectList.length
        : 0,
      numProjects: this.props.numProjectsToShow,
      // Disables the View More button when a network request is pending.
      disableViewMore: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      maxNumProjects: nextProps.projectList ? nextProps.projectList.length : 0
    });
  }

  viewMore = () => {
    this.props.navigateFunction(this.props.labKey);
  };

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
        isDetailView={this.props.isDetailView}
      />
    );
  }

  loadMore = () => {
    if (this.state.disableViewMore) {
      return;
    }

    const newNumProjects = this.state.numProjects + NUM_PROJECTS_TO_ADD;
    this.setState({numProjects: newNumProjects});

    // Fetch more projects if we do not have enough to show.
    const {hasOlderProjects} = this.props;
    if (this.state.maxNumProjects < newNumProjects && hasOlderProjects) {
      this.setState({disableViewMore: true});
      this.fetchOlderProjects().always(() => {
        this.setState({disableViewMore: false});
      });
    }
  };

  /**
   * Fetch additional projects of the specified type which were published
   * earlier than the oldest published project currently in our list.
   * @returns {$.Deferred} Deferred object after the network request has
   *   completed and the done handler has been run (if successful).
   */
  fetchOlderProjects() {
    const {projectList, labKey: projectType} = this.props;
    const oldestProject = projectList[projectList.length - 1];
    const oldestPublishedAt =
      oldestProject && oldestProject.projectData.publishedAt;

    return $.ajax({
      method: 'GET',
      url: `/api/v1/projects/gallery/public/${projectType}/${MAX_PROJECTS_PER_CATEGORY}/${oldestPublishedAt}`,
      dataType: 'json'
    }).done(data => {
      // olderProjects all have an older publishedAt date than oldestProject.
      const olderProjects = data[projectType];

      // Don't try to fetch projects of this projectType again in the future if we
      // received fewer than we asked for this time.
      if (olderProjects.length < MAX_PROJECTS_PER_CATEGORY) {
        this.props.setHasOlderProjects(false, projectType);
      }

      // Append any projects we just received to the appropriate list,
      // ignoring any duplicates. This preserves the newest-to-oldest
      // ordering of the project list.
      this.props.appendProjects(olderProjects, projectType);
    });
  }

  renderViewMoreButtons = () => {
    // Show the View More button if there are more projects to show on the
    // client or if there are more we could fetch from the server.
    const {hasOlderProjects} = this.props;
    const {maxNumProjects, numProjects} = this.state;
    const showViewMore = maxNumProjects >= numProjects || hasOlderProjects;

    return (
      <div style={styles.viewMoreButtons}>
        {showViewMore && (
          <Button
            __useDeprecatedTag
            onClick={this.loadMore}
            color={Button.ButtonColor.gray}
            icon="plus-circle"
            text={i18n.viewMore()}
            style={styles.buttonRightMargin}
          />
        )}
        <Button
          __useDeprecatedTag
          href="#top"
          color={Button.ButtonColor.gray}
          icon="chevron-circle-up"
          text={i18n.backToTop()}
        />
      </div>
    );
  };

  render() {
    return (
      <div
        style={styles.grid}
        className={`ui-project-app-type-area ui-${this.props.labKey}`}
      >
        <h2 style={styles.labHeading}> {this.props.labName} </h2>
        {!this.props.hideViewMoreLink && (
          <span
            className="viewMoreLink"
            style={styles.viewMore}
            onClick={this.viewMore}
          >
            {this.props.isDetailView && (
              <i className="fa fa-angle-left" style={styles.iconPaddingRight} />
            )}
            {this.props.labViewMoreString}
            {!this.props.isDetailView && (
              <i className="fa fa-angle-right" style={styles.iconPaddingLeft} />
            )}
          </span>
        )}
        <div style={styles.clear} />
        {this.renderProjectCardList(
          this.props.projectList,
          this.state.numProjects
        )}
        {this.props.isDetailView && this.renderViewMoreButtons()}
      </div>
    );
  }
}

const styles = {
  grid: {
    width: styleConstants['content-width']
  },
  labHeading: {
    textAlign: 'left',
    fontSize: 24,
    color: color.charcoal,
    marginBottom: 0,
    paddingBottom: 0,
    paddingTop: 0,
    float: 'left'
  },
  viewMore: {
    color: color.teal,
    float: 'right',
    marginTop: 35,
    cursor: 'pointer',
    fontFamily: '"Gotham 5r", sans-serif'
  },
  viewMoreButtons: {
    float: 'right',
    marginRight: 22
  },
  buttonRightMargin: {
    marginRight: 20
  },
  iconPaddingLeft: {
    paddingLeft: 6
  },
  iconPaddingRight: {
    paddingRight: 6
  },
  clear: {
    clear: 'both'
  }
};

export default connect(
  (state, ownProps) => ({
    hasOlderProjects: state.projects.hasOlderProjects[ownProps.labKey]
  }),
  {appendProjects, setHasOlderProjects}
)(ProjectAppTypeArea);
