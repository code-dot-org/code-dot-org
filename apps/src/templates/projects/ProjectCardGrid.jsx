import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import styleConstants from '../../styleConstants';
import color from '../../util/color';

import ProjectAppTypeArea from './ProjectAppTypeArea.jsx';
import {publishedFeaturedProjectPropType, Galleries} from './projectConstants';

const NUM_PROJECTS_ON_PREVIEW = 16;
const NUM_PROJECTS_IN_APP_VIEW = 16;

class ProjectCardGrid extends Component {
  constructor() {
    super();
    this.state = {
      showAll: true,
      showApp: '',
    };
  }

  static propTypes = {
    projectLists: PropTypes.shape({
      featured: PropTypes.arrayOf(publishedFeaturedProjectPropType),
      special_topic: PropTypes.arrayOf(publishedFeaturedProjectPropType),
    }).isRequired,
    galleryType: PropTypes.oneOf(['personal', 'public']).isRequired,
    selectedGallery: PropTypes.string.isRequired,
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.selectedGallery !== this.props.selectedGallery &&
      nextProps.selectedGallery === Galleries.PUBLIC
    ) {
      this.setState({showAll: true, showApp: ''});
    }
  }

  onSelectApp = appType => {
    const projectGridDiv = document.getElementById('projectCardGrid');
    if (projectGridDiv) {
      const projectGridRect = projectGridDiv.getBoundingClientRect();
      window.scrollTo(
        projectGridRect.left + window.pageXOffset,
        projectGridRect.top + window.pageYOffset
      );
    }
    this.setState({showAll: false, showApp: appType});
  };

  viewAllProjects = () => {
    this.setState({showAll: true, showApp: ''});
  };

  render() {
    const {projectLists} = this.props;
    const showSpecialTopic = experiments.isEnabled(experiments.SPECIAL_TOPIC);
    const numProjects = this.state.showAll
      ? NUM_PROJECTS_ON_PREVIEW
      : NUM_PROJECTS_IN_APP_VIEW;

    return (
      <div id="projectCardGrid" style={styles.grid}>
        {this.state.showAll && (
          <div>
            {showSpecialTopic && (
              <ProjectAppTypeArea
                labKey="special_topic"
                labName={i18n.projectTypeSpecialTopic()}
                labViewMoreString={i18n.projectTypeSpecialTopicViewMore()}
                projectList={projectLists.special_topic}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.onSelectApp}
                isDetailView={false}
                hideWithoutThumbnails={true}
              />
            )}
            <ProjectAppTypeArea
              labKey="featured"
              labName={i18n.featuredProjects()}
              projectList={projectLists.featured}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
              isDetailView={false}
              hideViewMoreLink={true}
              hideWithoutThumbnails={false}
            />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  grid: {
    width: styleConstants['content-width'],
  },
  link: {
    color: color.light_teal,
  },
};

export default connect(state => ({
  selectedGallery: state.projects.selectedGallery,
}))(ProjectCardGrid);
