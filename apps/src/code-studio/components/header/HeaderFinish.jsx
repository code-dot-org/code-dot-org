import PropTypes from 'prop-types';
import React from 'react';
import headerVignetteStyles from './HeaderVignette';
import $ from 'jquery';

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

export default class HeaderFinish extends React.Component {
  static propTypes = {
    lessonData: PropTypes.object,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    isRtl: PropTypes.bool
  };

  setDesiredWidth() {
    // Report back to our parent how wide we would like to be.
    const fullWidth = $('.header_finished').width();
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

    const headerFinishedComponent = $('.header_finished');
    const fullWidth =
      headerFinishedComponent.length > 0 ? headerFinishedComponent.width() : 0;
    const actualWidth = this.props.width;

    const vignetteStyle =
      actualWidth < fullWidth
        ? isRtl
          ? headerVignetteStyles.left
          : headerVignetteStyles.right
        : null;

    console.log('HeaderFinish render', this.props.width);

    return (
      <div style={styles.headerContainer}>
        <div className="header_finished" style={styles.headerInner}>
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
