import PropTypes from 'prop-types';
import React from 'react';
import ToggleGroup from '../ToggleGroup';
import color from '@cdo/apps/util/color';
import {connect} from 'react-redux';
import {setCurrentView} from './sectionProgressRedux';
import {ViewType} from './sectionProgressConstants';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';

/**
 * A toggle that provides a way to switch between detail, summary, and standards views of
 * the progress a section of students have made in a course. Teacher view.
 */
class SectionProgressToggle extends React.Component {
  static propTypes = {
    showStandardsToggle: PropTypes.bool,
    // Redux provided
    currentView: PropTypes.string.isRequired,
    setCurrentView: PropTypes.func.isRequired,
    sectionId: PropTypes.number,
    scriptId: PropTypes.number
  };

  onChange = selectedToggle => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'view_change_toggle',
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          old_view: this.props.currentView,
          new_view: selectedToggle,
          script_id: this.props.scriptId
        })
      },
      {includeUserId: true}
    );
    this.props.setCurrentView(selectedToggle);
  };

  render() {
    const {currentView, showStandardsToggle} = this.props;
    return (
      <ToggleGroup
        selected={currentView}
        activeColor={color.teal}
        onChange={this.onChange}
      >
        <button
          type="button"
          value={ViewType.SUMMARY}
          style={styles.toggleButton}
        >
          <div>{i18n.lessons()}</div>
        </button>
        <button
          type="button"
          id={'uitest-toggle-detail-view'}
          value={ViewType.DETAIL}
          style={styles.toggleButton}
        >
          <div>{i18n.levels()}</div>
        </button>
        {showStandardsToggle && (
          <button
            type="button"
            value={ViewType.STANDARDS}
            style={styles.toggleButton}
            id="uitest-standards-toggle"
          >
            <div>{i18n.standards()}</div>
          </button>
        )}
      </ToggleGroup>
    );
  }
}

const styles = {
  toggleButton: {
    padding: '3px 20px',
    height: 34,
    margin: 'auto auto 10px auto'
  }
};

export const UnconnectedSectionProgressToggle = SectionProgressToggle;

export default connect(
  state => ({
    currentView: state.sectionProgress.currentView,
    sectionId: state.sectionData.section.id,
    scriptId: state.scriptSelection.scriptId
  }),
  dispatch => ({
    setCurrentView(viewType) {
      dispatch(setCurrentView(viewType));
    }
  })
)(SectionProgressToggle);
