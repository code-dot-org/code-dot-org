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

class ProjectInfo extends React.Component {
  static propTypes = {
    currentHeader: PropTypes.oneOf(Object.values(possibleHeaders)),
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    isRtl: PropTypes.bool
  };

  getFullWidth() {
    const component = $(this.refs.projectInfo);
    return component.length > 0 ? component.width() : 0;
  }

  setDesiredWidth() {
    // Report back to our parent how wide we would like to be.
    if (this.props.setDesiredWidth) {
      this.props.setDesiredWidth(this.getFullWidth());
    }
  }

  componentDidMount() {
    this.setDesiredWidth();
  }

  componentDidUpdate() {
    this.setDesiredWidth();
  }

  onChangedWidth() {
    this.setDesiredWidth();
  }

  render() {
    if (!this.props.currentHeader) {
      return null;
    }

    const fullWidth = this.getFullWidth();
    const actualWidth = this.props.width;

    const vignetteStyle =
      actualWidth < fullWidth
        ? this.props.isRtl
          ? headerVignetteStyles.left
          : headerVignetteStyles.right
        : null;

    const HeaderComponent = headerComponents[this.props.currentHeader];
    return (
      <div style={styles.headerContainer}>
        <div
          className="project_info"
          ref="projectInfo"
          style={styles.projectInfo}
        >
          <HeaderComponent onChangedWidth={() => this.onChangedWidth()} />
        </div>
        <div className="vignette" style={vignetteStyle} />
      </div>
    );
  }
}

const styles = {
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    height: 38
  },
  projectInfo: {
    position: 'absolute'
  }
};

export const UnconnectedProjectInfo = ProjectInfo;
export default connect(state => ({
  currentHeader: state.header.currentHeader
}))(ProjectInfo);
