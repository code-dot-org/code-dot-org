import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import MinimalProjectHeader from './MinimalProjectHeader';
import ProjectBackedHeader from './ProjectBackedHeader';
import LevelBuilderSaveButton from './LevelBuilderSaveButton';

class ProjectInfo extends React.Component {
  static propTypes = {
    showMinimalProjectHeader: PropTypes.bool,
    showProjectBackedHeader: PropTypes.bool,
    showLevelBuilderSaveButton: PropTypes.bool
  };

  render() {
    return (
      <div>
        {this.props.showMinimalProjectHeader && <MinimalProjectHeader />}
        {this.props.showProjectBackedHeader && <ProjectBackedHeader />}
        {this.props.showLevelBuilderSaveButton && <LevelBuilderSaveButton />}
      </div>
    );
  }
}

export default connect(state => ({
  showMinimalProjectHeader: state.header.showMinimalProjectHeader,
  showProjectBackedHeader: state.header.showProjectBackedHeader,
  showLevelBuilderSaveButton: state.header.showLevelBuilderSaveButton
}))(ProjectInfo);
