import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {possibleHeaders} from '../../headerRedux';

import LevelBuilderSaveButton from './LevelBuilderSaveButton';
import measureRenderedWidth from './measureRenderedWidth';
import MinimalProjectHeader from './MinimalProjectHeader';
import ProjectBackedHeader from './ProjectBackedHeader';
import ProjectHeader from './ProjectHeader';
import remeasureOnFontsReady from './remeasureOnFontsReady';

const headerComponents = {
  [possibleHeaders.project]: ProjectHeader,
  [possibleHeaders.minimalProject]: MinimalProjectHeader,
  [possibleHeaders.projectBacked]: ProjectBackedHeader,
  [possibleHeaders.levelBuilderSave]: LevelBuilderSaveButton,
};

class ProjectInfo extends React.Component {
  static propTypes = {
    currentHeader: PropTypes.oneOf(Object.values(possibleHeaders)),
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    isRtl: PropTypes.bool,
  };

  getFullWidth() {
    // The trailing button (Remix) has a 1px border flush against the right edge
    // of this width, and the parent clips to it (.project_info_container, in
    // dashboard's application.scss). Round up so the report never falls short
    // of the true sub-pixel extent: a rounded-down report lands the clip inside
    // the content and shaves that border. No slack beyond the ceiling, since
    // HeaderMiddle rations the row — surplus reserved here comes out of the
    // lesson title's share.
    return Math.ceil(measureRenderedWidth(this.refs.projectInfo));
  }

  setDesiredWidth() {
    // Report back to our parent how wide we would like to be.
    if (this.props.setDesiredWidth) {
      this.props.setDesiredWidth(this.getFullWidth());
    }
  }

  componentDidMount() {
    this.setDesiredWidth();
    this.cancelFontRemeasure = remeasureOnFontsReady(() =>
      this.setDesiredWidth()
    );
  }

  componentWillUnmount() {
    this.cancelFontRemeasure?.();
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

    const HeaderComponent = headerComponents[this.props.currentHeader];
    return (
      <div className="project_info_container" style={styles.headerContainer}>
        <div
          className="project_info"
          ref="projectInfo"
          style={styles.projectInfo}
        >
          <HeaderComponent onChangedWidth={() => this.onChangedWidth()} />
        </div>
      </div>
    );
  }
}

const styles = {
  headerContainer: {
    position: 'relative',
    height: 38,
  },
  projectInfo: {
    position: 'absolute',
  },
};

export const UnconnectedProjectInfo = ProjectInfo;
export default connect(state => ({
  currentHeader: state.header.currentHeader,
}))(ProjectInfo);
