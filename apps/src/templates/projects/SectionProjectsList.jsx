import React from 'react';
import ProjectsList from './ProjectsList';

class SectionProjectsList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <ProjectsList {...this.props} />;
  }
}

SectionProjectsList.propTypes = {
  projectsData: React.PropTypes.array.isRequired,
  // The prefix for the code studio url in the current environment,
  // e.g. '//studio.code.org' or '//localhost-studio.code.org:3000'.
  studioUrlPrefix: React.PropTypes.string.isRequired,
};

export default SectionProjectsList;
