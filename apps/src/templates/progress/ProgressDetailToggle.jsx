import React, { PropTypes } from 'react';
import ToggleGroup from '../ToggleGroup';
import color from "@cdo/apps/util/color";
import { setIsSummaryView, hasGroups } from '@cdo/apps/code-studio/progressRedux';
import { connect } from 'react-redux';

import summaryActive from './images/toggleSummaryActive.png';
import summaryInactive from './images/toggleSummaryInactive.png';
import detailActive from './images/toggleDetailActive.png';
import detailInactive from './images/toggleDetailInactive.png';

import groupSummaryActive from './images/groupToggleSummaryActive.png';
import groupSummaryInactive from './images/groupToggleSummaryInactive.png';
import groupDetailActive from './images/groupToggleDetailActive.png';
import groupDetailInactive from './images/groupToggleDetailInactive.png';

const imageSets = {
  teal: {
    summaryActive,
    summaryInactive,
    detailActive,
    detailInactive
  },
  purple: {
    summaryActive: groupSummaryActive,
    summaryInactive: groupSummaryInactive,
    detailActive: groupDetailActive,
    detailInactive: groupDetailInactive,
  }
};

const styles = {
  whiteBorder: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.white
  },
  icon: {
    fontSize: 20,
    paddingLeft: 3,
    paddingRight: 3,
    paddingTop: 6,
    paddingBottom: 3,
    // If not set explicitly, css sets "button > img" to 0.6
    opacity: 1,
  }
};
/**
 * A toggle that provides a way to switch between detail and summary views of
 * our course progress.
 */
const ProgressDetailToggle = React.createClass({
  propTypes: {
    activeColor: PropTypes.string,
    whiteBorder: PropTypes.bool,

    // redux backed
    isSummaryView: PropTypes.bool.isRequired,
    hasGroups: PropTypes.bool.isRequired,
    setIsSummaryView: PropTypes.func.isRequired
  },

  onChange() {
    this.props.setIsSummaryView(!this.props.isSummaryView);
  },

  render() {
    const { whiteBorder, isSummaryView, hasGroups } = this.props;

    let activeColor = this.props.activeColor;
    if (!activeColor) {
      activeColor = hasGroups ? color.purple : color.cyan;
    }

    const images = activeColor === color.purple ? imageSets.purple : imageSets.teal;
    return (
      <ToggleGroup
        selected={isSummaryView ? "summary" : "detail"}
        activeColor={activeColor}
        onChange={this.onChange}
      >
        <button value="summary" style={whiteBorder ? styles.whiteBorder : undefined}>
          <img
            src={isSummaryView ? images.summaryActive : images.summaryInactive}
            style={styles.icon}
          />
        </button>
        <button value="detail" style={whiteBorder ? styles.whiteBorder : undefined}>
          <img
            src={isSummaryView ? images.detailInactive : images.detailActive}
            style={styles.icon}
          />
        </button>
      </ToggleGroup>
    );

  }
});

export default connect(
  state => ({
    isSummaryView: state.progress.isSummaryView,
    hasGroups: hasGroups(state.progress)
  }),
  {setIsSummaryView}
)(ProgressDetailToggle);
