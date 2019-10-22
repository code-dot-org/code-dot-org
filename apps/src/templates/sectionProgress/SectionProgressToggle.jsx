import PropTypes from 'prop-types';
import React from 'react';
import ToggleGroup from '../ToggleGroup';
import color from '@cdo/apps/util/color';
import {connect} from 'react-redux';
import {setCurrentView, ViewType} from './sectionProgressRedux';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';

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
    sectionId: PropTypes.number,
    userId: PropTypes.number
  };

  state = {
    selectedToggle: this.props.currentView
  };

  componentWillReceiveProps(nextProps) {
    // currentView can be set externally, and the component will
    // still need to update when that happens.
    if (this.state.selectedToggle !== nextProps.currentView) {
      this.setState({selectedToggle: nextProps.currentView});
    }
  }

  onChange = () => {
    // Display the toggle based on the internal state so that it is
    // more immediately responsive. Once setting internal state is
    // complete, then update the redux currentView.
    // Timeouts forces a render of the local state before dispatching
    // the action.
    if (this.state.selectedToggle === ViewType.SUMMARY) {
      firehoseClient.putRecord({
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'view_change_toggle',
        user_id: this.props.userId,
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          old_view: ViewType.SUMMARY,
          new_view: ViewType.DETAIL
        })
      });
      this.setState({selectedToggle: ViewType.DETAIL}, () => {
        setTimeout(() => {
          this.props.setCurrentView(ViewType.DETAIL);
        }, 0);
      });
    } else {
      firehoseClient.putRecord({
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'view_change_toggle',
        user_id: this.props.userId,
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          old_view: ViewType.DETAIL,
          new_view: ViewType.SUMMARY
        })
      });
      this.setState({selectedToggle: ViewType.SUMMARY}, () => {
        setTimeout(() => {
          this.props.setCurrentView(ViewType.SUMMARY);
        }, 0);
      });
    }
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
      </ToggleGroup>
    );
  }
}

export const UnconnectedSectionProgressToggle = SectionProgressToggle;

export default connect(
  state => ({
    currentView: state.sectionProgress.currentView,
    sectionId: state.sectionProgress.section.id,
    userId: state.currentUser.userId
  }),
  dispatch => ({
    setCurrentView(viewType) {
      dispatch(setCurrentView(viewType));
    }
  })
)(SectionProgressToggle);
