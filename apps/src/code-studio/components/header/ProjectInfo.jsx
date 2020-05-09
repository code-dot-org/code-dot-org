import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectHeader from './ProjectHeader';
import MinimalProjectHeader from './MinimalProjectHeader';
import ProjectBackedHeader from './ProjectBackedHeader';
import LevelBuilderSaveButton from './LevelBuilderSaveButton';
import {possibleHeaders} from '../../headerRedux';
import Measure from 'react-measure';

const headerComponents = {
  [possibleHeaders.project]: ProjectHeader,
  [possibleHeaders.minimalProject]: MinimalProjectHeader,
  [possibleHeaders.projectBacked]: ProjectBackedHeader,
  [possibleHeaders.levelBuilderSave]: LevelBuilderSaveButton
};

class ProjectInfo extends React.Component {
  static propTypes = {
    currentHeader: PropTypes.oneOf(Object.values(possibleHeaders)),
    onComponentResize: PropTypes.func.isRequired
  };

  render() {
    if (!this.props.currentHeader) {
      return null;
    }

    const HeaderComponent = headerComponents[this.props.currentHeader];
    return (
      <Measure
        bounds
        onResize={contentRect => {
          //this.setState({ dimensions: contentRect.bounds })
          //console.log(contentRect.bounds);
          this.props.onComponentResize(contentRect.bounds.width);
        }}
      >
        {({measureRef}) => (
          <div ref={measureRef}>
            <HeaderComponent />
          </div>
        )}
      </Measure>
    );
  }
}

export const UnconnectedProjectInfo = ProjectInfo;
export default connect(state => ({
  currentHeader: state.header.currentHeader
}))(ProjectInfo);
