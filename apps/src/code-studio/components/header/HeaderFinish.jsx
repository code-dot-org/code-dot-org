import PropTypes from 'prop-types';
import React from 'react';
import headerVignetteStyles from './HeaderVignette';
import $ from 'jquery';

export default class HeaderFinish extends React.Component {
  static propTypes = {
    lessonData: PropTypes.object,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    isRtl: PropTypes.bool
  };

  getFullWidth() {
    const component = $(this.refs.headerFinish);
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

  shouldComponentUpdate(nextProps, nextState) {
    const lessonData = this.props.lessonData;

    return (
      this.props.width !== nextProps.width ||
      !!lessonData !== !!nextProps.lessonData ||
      lessonData.finishLink !== nextProps.lessonData.finishLink
    );
  }

  render() {
    const {lessonData, isRtl} = this.props;

    const fullWidth = this.getFullWidth();
    const actualWidth = this.props.width;

    const vignetteStyle =
      actualWidth < fullWidth
        ? isRtl
          ? headerVignetteStyles.left
          : headerVignetteStyles.right
        : null;

    return (
      <div style={styles.headerContainer}>
        <div
          className="header_finished"
          ref="headerFinish"
          style={styles.headerInner}
        >
          <div className="header_finished_link" style={styles.finishedLink}>
            <a href={lessonData.finishLink} title={lessonData.finishText}>
              {lessonData.finishText}
            </a>
          </div>
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
    height: 18
  },
  headerInner: {
    position: 'absolute'
  },
  scriptLinkWithUpdatedAt: {
    display: 'block'
  },
  outerContainer: {
    textAlign: 'right'
  },
  containerWithUpdatedAt: {
    verticalAlign: 'bottom',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block'
  }
};
