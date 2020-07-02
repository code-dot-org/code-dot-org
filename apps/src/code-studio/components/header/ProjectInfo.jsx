import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ProjectHeader from './ProjectHeader';
import MinimalProjectHeader from './MinimalProjectHeader';
import ProjectBackedHeader from './ProjectBackedHeader';
import LevelBuilderSaveButton from './LevelBuilderSaveButton';
import {possibleHeaders} from '../../headerRedux';
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
  },
  headerVignetteRight: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background:
      'linear-gradient(to right, rgba(0, 173, 188, 0) calc(100% - 20px), rgba(0, 173, 188, 1) 100%)'
  }
};

class ProjectInfo extends React.Component {
  static propTypes = {
    currentHeader: PropTypes.oneOf(Object.values(possibleHeaders)),
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func
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
      actualWidth < fullWidth ? styles.headerVignetteRight : null;

    console.log('ProjectInfo render', this.props.width);

    const HeaderComponent = headerComponents[this.props.currentHeader];
    return (
      <div style={styles.headerContainer}>
        <div className="project_info" style={styles.projectInfo}>
          <HeaderComponent />
        </div>
        <div id="vignette" style={vignetteStyle} />
      </div>
    );
  }
}

export const UnconnectedProjectInfo = ProjectInfo;
export default connect(state => ({
  currentHeader: state.header.currentHeader
}))(ProjectInfo);
