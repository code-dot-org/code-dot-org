import {Typography as MuiTypography} from '@mui/material';
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
        <MuiTypography variant="h3" component="h3" gutterBottom>
          Featured Projects
        </MuiTypography>
        <FeaturedProjectsTable
          activeList={this.props.activeFeaturedProjects}
          bookmarkedList={this.props.bookmarkedFeaturedProjects}
          archivedList={this.props.archivedFeaturedProjects}
        />
      </div>
    );
  }
}
