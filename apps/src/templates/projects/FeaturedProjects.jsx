import React, {PropTypes} from 'react';
import FeaturedProjectsTable from './FeaturedProjectsTable';
import {featuredProjectDataPropType} from './projectConstants';

export default class FeaturedProjects extends React.Component {
  static propTypes = {
    currentFeaturedProjects: PropTypes.arrayOf(featuredProjectDataPropType).isRequired,
    archivedUnfeaturedProjects: PropTypes.arrayOf(featuredProjectDataPropType).isRequired,
  };

  render() {
    return (
      <div>
        <h3>Currently Featured Projects</h3>
        <FeaturedProjectsTable
          projectList={this.props.currentFeaturedProjects}
          tableVersion="currentFeatured"
        />
        <h3>Archive of Previously Featured Projects</h3>
        <FeaturedProjectsTable
          projectList={this.props.archivedUnfeaturedProjects}
          tableVersion="archivedUnfeatured"
        />
      </div>
    );
  }
}
