import React, { PropTypes } from 'react';
import ToggleGroup from '../ToggleGroup';
import color from "@cdo/apps/util/color";
import { setIsSummaryView } from '@cdo/apps/code-studio/progressRedux';
import { connect } from 'react-redux';

import summaryActive from './toggleSummaryActive.png';
import summaryInactive from './toggleSummaryInactive.png';
import detailActive from './toggleDetailActive.png';
import detailInactive from './toggleDetailInactive.png';

const styles = {
  icon: {
    fontSize: 20,
    paddingLeft: 3,
    paddingRight: 3,
    paddingTop: 6,
    paddingBottom: 3,
    // If not set explicitly, css sets "button > img" to 0.6
    opacity: 1
  }
};
/**
 * A toggle that provides a way to switch between detail and summary views of
 * our course progress.
 */
const ProgressDetailToggle = React.createClass({
  propTypes: {
    isSummaryView: PropTypes.bool.isRequired,
    setIsSummaryView: PropTypes.func.isRequired
  },

  onChange() {
    this.props.setIsSummaryView(!this.props.isSummaryView);
  },

  render() {
    const { isSummaryView } = this.props;
    return (
      <ToggleGroup
        selected={isSummaryView ? "summary" : "detail"}
        activeColor={color.cyan}
        onChange={this.onChange}
      >
        <button value="summary">
          <img
            src={isSummaryView ? summaryActive : summaryInactive}
            style={styles.icon}
          />
        </button>
        <button value="detail">
          <img
            src={isSummaryView ? detailInactive : detailActive}
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
  }),
  {setIsSummaryView}
)(ProgressDetailToggle);
