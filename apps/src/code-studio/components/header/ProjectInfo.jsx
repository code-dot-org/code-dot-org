import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {possibleHeaders} from '../../headerRedux';

import LevelBuilderSaveButton from './LevelBuilderSaveButton';
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
    const el = this.refs.projectInfo;
    if (!el) {
      return 0;
    }
    // getBoundingClientRect + ceil: jQuery .width() can under-report by a
    // subpixel, and overflow:hidden then clips the remix button's right border.
    // That hairline is obvious on 1x external displays, often invisible on Retina.
    return Math.ceil(el.getBoundingClientRect().width);
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
      <div style={styles.headerContainer}>
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

// The nav-reskin focus ring paints 3px outside the buttons; the overflow
// guard would clip it at the container edges.
const navReskin = document.documentElement.classList.contains('nav-reskin');

const styles = {
  headerContainer: {
    position: 'relative',
    ...(navReskin ? {} : {overflow: 'hidden'}),
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
