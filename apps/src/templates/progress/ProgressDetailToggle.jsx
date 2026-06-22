import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {setIsSummaryView} from '@cdo/apps/code-studio/progressRedux';
<<<<<<< HEAD
import {hasGroups} from '@cdo/apps/code-studio/progressReduxSelectors';
import i18n from '@cdo/locale';

=======
import i18n from '@cdo/locale';

const SUMMARY = 'summary';
const DETAIL = 'detail';

>>>>>>> staging
/**
 * A toggle that provides a way to switch between detail and summary views of
 * our course progress. DSCO SegmentedButtons in `iconOnly` mode renders the
 * paired list-view / card-view icons and handles its own selected/unselected
 * styling, focus management, and accessibility.
 */
class ProgressDetailToggle extends React.Component {
  static propTypes = {
<<<<<<< HEAD
=======
    toggleStudyGroup: PropTypes.string,

>>>>>>> staging
    // redux backed
    isSummaryView: PropTypes.bool.isRequired,
    setIsSummaryView: PropTypes.func.isRequired,
  };

  onChange = value => {
<<<<<<< HEAD
    this.props.setIsSummaryView(value === 'summary');
=======
    this.props.setIsSummaryView(value === SUMMARY);
>>>>>>> staging
  };

  render() {
    const {isSummaryView} = this.props;
<<<<<<< HEAD

    return (
      <SegmentedButtons
        selectedButtonValue={isSummaryView ? 'summary' : 'detail'}
        onChange={this.onChange}
        size="xs"
        buttons={[
          {value: 'summary', label: i18n.summaryView()},
          {
            value: 'detail',
            label: i18n.detailView(),
            className: 'uitest-toggle-detail',
=======
    return (
      <SegmentedButtons
        type="iconOnly"
        size="s"
        selectedButtonValue={isSummaryView ? SUMMARY : DETAIL}
        onChange={this.onChange}
        buttons={[
          {
            value: SUMMARY,
            icon: {iconName: 'list'},
            ariaLabel: i18n.summaryView(),
          },
          {
            value: DETAIL,
            icon: {iconName: 'window-maximize'},
            ariaLabel: i18n.detailView(),
            id: 'uitest-toggle-detail',
>>>>>>> staging
          },
        ]}
      />
    );
  }
}

export const UnconnectedProgressDetailToggle = ProgressDetailToggle;

export default connect(
  state => ({
    isSummaryView: state.progress.isSummaryView,
  }),
  {setIsSummaryView}
)(ProgressDetailToggle);
