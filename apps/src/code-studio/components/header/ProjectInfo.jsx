import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectHeader from './ProjectHeader';
import MinimalProjectHeader from './MinimalProjectHeader';
import ProjectBackedHeader from './ProjectBackedHeader';
import LevelBuilderSaveButton from './LevelBuilderSaveButton';

import {possibleHeaders} from '../../headerRedux';

const headerComponents = {
  [possibleHeaders.project]: ProjectHeader,
  [possibleHeaders.minimalProject]: MinimalProjectHeader,
  [possibleHeaders.projectBacked]: ProjectBackedHeader,
  [possibleHeaders.levelBuilderSave]: LevelBuilderSaveButton
};

class ProjectInfo extends React.Component {
  static propTypes = {
    currentHeader: PropTypes.oneOf(Object.values(possibleHeaders))
  };

  render() {
    if (!this.props.currentHeader) {
      return null;
    }

    const HeaderComponent = headerComponents[this.props.currentHeader];
    return <HeaderComponent />;
  }
}

export const UnconnectedProjectInfo = ProjectInfo;
export default connect(state => ({
  currentHeader: state.header.currentHeader
}))(ProjectInfo);
