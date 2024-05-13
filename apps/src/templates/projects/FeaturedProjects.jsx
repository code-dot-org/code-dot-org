import PropTypes from 'prop-types';
import React from 'react';

import FeaturedProjectsTable from './FeaturedProjectsTable';
import {featuredProjectDataPropType} from './projectConstants';

export default class FeaturedProjects extends React.Component {
  static propTypes = {
    activeFeaturedProjects: PropTypes.arrayOf(featuredProjectDataPropType)
      .isRequired,
    archivedFeaturedProjects: PropTypes.arrayOf(featuredProjectDataPropType)
      .isRequired,
    bookmarkedFeaturedProjects: PropTypes.arrayOf(featuredProjectDataPropType)
      .isRequired,
  };

  render() {
    return (
      <div>
        <h3>Featured Projects</h3>
        <FeaturedProjectsTable
          activeList={this.props.activeFeaturedProjects}
          bookmarkedList={this.props.bookmarkedFeaturedProjects}
          archivedList={this.props.archivedFeaturedProjects}
        />
      </div>
    );
  }
}
