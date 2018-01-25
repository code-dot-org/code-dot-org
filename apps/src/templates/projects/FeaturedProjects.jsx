import React from 'react';
import FeaturedProjectsTable from './FeaturedProjectsTable';

export default class FeaturedProjects extends React.Component {
  render() {
    return (
      <div>
        <h3>Currently Featured Projects</h3>
        <FeaturedProjectsTable
          projectList={[]}
          tableVersion="currentFeatured"
        />
      <h3>Archive of Featured Projects</h3>
        <FeaturedProjectsTable
          projectList={[]}
          tableVersion="archiveFeatured"
        />
      </div>
    );
  }
}
