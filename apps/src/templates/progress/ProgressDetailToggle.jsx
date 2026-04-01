import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {setIsSummaryView} from '@cdo/apps/code-studio/progressRedux';
import {hasGroups} from '@cdo/apps/code-studio/progressReduxSelectors';
import i18n from '@cdo/locale';

/**
 * A toggle that provides a way to switch between detail and summary views of
 * our course progress.
 */
class ProgressDetailToggle extends React.Component {
  static propTypes = {
    // redux backed
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired,
    hasGroups: PropTypes.bool.isRequired,
    setIsSummaryView: PropTypes.func.isRequired,
  };

  onChange = value => {
    this.props.setIsSummaryView(value === 'summary');
  };

  render() {
    const {isSummaryView} = this.props;

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
          },
        ]}
      />
    );
  }
}

export const UnconnectedProgressDetailToggle = ProgressDetailToggle;

export default connect(
  state => ({
    isPlc: !!state.progress.deeperLearningCourse,
    isSummaryView: state.progress.isSummaryView,
    hasGroups: hasGroups(state.progress),
  }),
  {setIsSummaryView}
)(ProgressDetailToggle);
