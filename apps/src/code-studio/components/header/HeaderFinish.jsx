import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import remeasureOnFontsReady from './remeasureOnFontsReady';

export default class HeaderFinish extends React.Component {
  static propTypes = {
    lessonData: PropTypes.object,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    isRtl: PropTypes.bool,
  };

  getFullWidth() {
    const component = $(this.refs.headerFinish);
    return component.length > 0 ? component.width() : 0;
  }

  setDesiredWidth() {
    if (!this.props.setDesiredWidth || this._isTruncated) return;
    this.props.setDesiredWidth(this.getFullWidth());
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

  shouldComponentUpdate(nextProps, nextState) {
    const lessonData = this.props.lessonData;

    return (
      this.props.width !== nextProps.width ||
      !!lessonData !== !!nextProps.lessonData ||
      lessonData.finishLink !== nextProps.lessonData.finishLink
    );
  }

  render() {
    const {lessonData} = this.props;

    const fullWidth = this.getFullWidth();
    const actualWidth = this.props.width;
    const isTruncated = actualWidth > 0 && fullWidth > actualWidth;
    this._isTruncated = isTruncated;

    const ellipsisStyle = isTruncated
      ? {
          display: 'block',
          width: actualWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }
      : {};

    return (
      <div style={styles.headerContainer}>
        <div
          className="header_finished"
          ref="headerFinish"
          style={styles.headerInner}
        >
          <div className="header_finished_link" style={styles.finishedLink}>
            <a
              href={lessonData.finishLink}
              title={lessonData.finishText}
              style={ellipsisStyle}
            >
              {lessonData.finishText}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    height: 18,
  },
  headerInner: {
    position: 'absolute',
  },
  scriptLinkWithUpdatedAt: {
    display: 'block',
  },
  outerContainer: {
    textAlign: 'right',
  },
  containerWithUpdatedAt: {
    verticalAlign: 'bottom',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
  },
};
