import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import i18n from '@cdo/locale';

import styleConstants from '../../styleConstants';
import color from '../../util/color';
import Button from '../Button';

import ProjectCardRow from './ProjectCardRow';
import {
  MAX_PROJECTS_PER_CATEGORY,
  publishedFeaturedProjectPropType,
} from './projectConstants';
import {appendProjects, setHasOlderProjects} from './projectsRedux';

const NUM_PROJECTS_TO_ADD = 12;

class ProjectAppTypeArea extends React.Component {
  static propTypes = {
    labKey: PropTypes.string.isRequired,
    labName: PropTypes.string.isRequired,
    // Ability to hide link for Applab and Gamelab
    hideViewMoreLink: PropTypes.bool,
    projectList: PropTypes.arrayOf(publishedFeaturedProjectPropType),
    numProjectsToShow: PropTypes.number.isRequired,
    galleryType: PropTypes.oneOf(['personal', 'class', 'public']).isRequired,
    // Hide projects that don't have thumbnails
    hideWithoutThumbnails: PropTypes.bool,

    // We are temporarily not using the following props since we are not using the 'View more' link
    // in the updated featured projects public gallery.
    // However, there are plans to update the featured projects public gallery with
    // sections and use the view more links in the future. See https://docs.google.com/document/d/1vU68tzXG72Z80MvM6xYEDwF5hLDf7V097P-0dDfpouc/edit?disco=AAABGLQtJe0.
    labViewMoreString: PropTypes.string,
    navigateFunction: PropTypes.func,
    // Only show one project type.
    isDetailView: PropTypes.bool,
    // from redux state
    hasOlderProjects: PropTypes.bool,
    // from redux dispatch
    appendProjects: PropTypes.func,
    setHasOlderProjects: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      maxNumProjects: this.props.projectList
        ? this.props.projectList.length
        : 0,
      numProjects: this.props.numProjectsToShow,
      // Disables the View More button when a network request is pending.
      disableViewMore: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      maxNumProjects: nextProps.projectList ? nextProps.projectList.length : 0,
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
    const projectType =
      this.props.labKey === 'featured' ? 'all' : this.props.labKey;
    const {projectList} = this.props;
    const projectListToSort = [...projectList];
    // Sort from least recent (oldest) to most recent featured_at date.
    projectListToSort.sort((a, b) => {
      const projectAFeaturedAt = a.projectData.featuredAt;
      const projectBFeaturedAt = b.projectData.featuredAt;
      return projectAFeaturedAt.localeCompare(projectBFeaturedAt);
    });
    const oldestProject = projectListToSort[0];
    const oldestFeaturedAt =
      oldestProject && oldestProject.projectData.featuredAt;

    return $.ajax({
      method: 'GET',
      url: `/api/v1/projects/gallery/public/${projectType}/${oldestFeaturedAt}`,
      dataType: 'json',
    }).done(data => {
      // olderProjects all have an older featuredAt date than oldestProject.
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
            color={Button.ButtonColor.neutralDark}
            icon="plus-circle"
            text={i18n.viewMore()}
            style={styles.buttonRightMargin}
          />
        )}
        <Button
          __useDeprecatedTag
          href="#top"
          color={Button.ButtonColor.neutralDark}
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
  viewMore: {
    color: color.neutral_dark,
    float: 'right',
    marginTop: 35,
    marginBottom: 16,
    cursor: 'pointer',
    ...fontConstants['main-font-semi-bold'],
  },
  viewMoreButtons: {
    float: 'right',
    marginRight: 22,
  },
  buttonRightMargin: {
    marginRight: 20,
  },
  iconPaddingLeft: {
    paddingLeft: 6,
  },
  iconPaddingRight: {
    paddingRight: 6,
  },
  clear: {
    clear: 'both',
  },
};

export default connect(
  (state, ownProps) => ({
    hasOlderProjects: state.projects.hasOlderProjects[ownProps.labKey],
  }),
  {appendProjects, setHasOlderProjects}
)(ProjectAppTypeArea);
