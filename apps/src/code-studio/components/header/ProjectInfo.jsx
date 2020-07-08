import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ProjectHeader from './ProjectHeader';
import MinimalProjectHeader from './MinimalProjectHeader';
import ProjectBackedHeader from './ProjectBackedHeader';
import LevelBuilderSaveButton from './LevelBuilderSaveButton';
import {possibleHeaders} from '../../headerRedux';
import headerVignetteStyles from './HeaderVignette';
import $ from 'jquery';

const headerComponents = {
  [possibleHeaders.project]: ProjectHeader,
  [possibleHeaders.minimalProject]: MinimalProjectHeader,
  [possibleHeaders.projectBacked]: ProjectBackedHeader,
  [possibleHeaders.levelBuilderSave]: LevelBuilderSaveButton
};

const styles = {
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    height: 40
  },
  projectInfo: {
    position: 'absolute'
  }
};

class ProjectInfo extends React.Component {
  static propTypes = {
    currentHeader: PropTypes.oneOf(Object.values(possibleHeaders)),
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    isRtl: PropTypes.bool
  };

  setDesiredWidth() {
    // Report back to our parent how wide we would like to be.
    const fullWidth = $('.project_info').width();
    if (this.props.setDesiredWidth) {
      this.props.setDesiredWidth(fullWidth);
    }
  }

  componentDidMount() {
    this.setDesiredWidth();
  }

  componentDidUpdate() {
    this.setDesiredWidth();
  }

  render() {
    if (!this.props.currentHeader) {
      return null;
    }

    const fullWidth = $('.project_info').width();
    const actualWidth = this.props.width;

    const vignetteStyle =
      actualWidth < fullWidth
        ? this.props.isRtl
          ? headerVignetteStyles.left
          : headerVignetteStyles.right
        : null;

    console.log('ProjectInfo render', this.props.width);

    const HeaderComponent = headerComponents[this.props.currentHeader];
    return (
      <div style={styles.headerContainer}>
        <div className="project_info" style={styles.projectInfo}>
          <HeaderComponent />
        </div>
        <div className="vignette" style={vignetteStyle} />
      </div>
    );
  }
}

export const UnconnectedProjectInfo = ProjectInfo;
export default connect(state => ({
  currentHeader: state.header.currentHeader
}))(ProjectInfo);
