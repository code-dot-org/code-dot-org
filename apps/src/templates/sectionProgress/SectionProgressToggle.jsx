import PropTypes from 'prop-types';
import React from 'react';
import ToggleGroup from '../ToggleGroup';
import color from '@cdo/apps/util/color';
import {connect} from 'react-redux';
import {setCurrentView, ViewType} from './sectionProgressRedux';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';

const styles = {
  toggleButton: {
    padding: '3px 20px',
    height: 34,
    margin: 'auto auto 10px auto'
  }
};

/**
 * A toggle that provides a way to switch between detail and summary views of
 * the progress a section of students have made in a course. Teacher view.
 */
class SectionProgressToggle extends React.Component {
  static propTypes = {
    currentView: PropTypes.string.isRequired,
    setCurrentView: PropTypes.func.isRequired,
    sectionId: PropTypes.number
  };

  state = {
    selectedToggle: this.props.currentView
  };

  componentWillReceiveProps(nextProps) {
    // currentView can be set externally, and the component will
    // still need to update when that happens.
    if (this.state.selectedToggle !== nextProps.currentView) {
      this.setState({
        selectedToggle: nextProps.currentView
      });
    }
  }

  onChange = selectedToggle => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'view_change_toggle',
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          old_view: this.state.selectedToggle,
          new_view: selectedToggle
        })
      },
      {includeUserId: true}
    );
    this.props.setCurrentView(selectedToggle);
  };

  render() {
    const {selectedToggle} = this.state;

    return (
      <ToggleGroup
        selected={selectedToggle}
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
        {experiments.isEnabled(experiments.STANDARDS_REPORT) && (
          <button
            type="button"
            value={ViewType.STANDARDS}
            style={styles.toggleButton}
          >
            <div>{i18n.standards()}</div>
          </button>
        )}
      </ToggleGroup>
    );
  }
}

export const UnconnectedSectionProgressToggle = SectionProgressToggle;

export default connect(
  state => ({
    currentView: state.sectionProgress.currentView,
    sectionId: state.sectionProgress.section.id
  }),
  dispatch => ({
    setCurrentView(viewType) {
      dispatch(setCurrentView(viewType));
    }
  })
)(SectionProgressToggle);
