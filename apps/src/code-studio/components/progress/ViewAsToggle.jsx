import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {setViewAsUserId} from '@cdo/apps/code-studio/progressRedux';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {ViewType, changeViewType} from '@cdo/apps/code-studio/viewAsRedux';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import commonMsg from '@cdo/locale';

/**
 * Toggle that lets us change between seeing a page as a teacher, or as the
 * student sees it
 */
class ViewAsToggle extends React.Component {
  static propTypes = {
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    changeViewType: PropTypes.func.isRequired,
    logToFirehose: PropTypes.func,
    isAsync: PropTypes.bool,
  };

  componentDidMount() {
    this.toggleHideAsStudent(this.props.viewAs);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.viewAs !== this.props.viewAs) {
      this.toggleHideAsStudent(nextProps.viewAs);
    }
  }

  toggleHideAsStudent = viewAs => {
    // Toggle hide-as-student appropriately (this is so that if we
    // load a page with ?viewAs=Participant we still hide teacher-only content)
    $('.hide-as-student').toggle(viewAs === ViewType.Instructor);
  };

  onChange = viewType => {
    const {changeViewType, isAsync, logToFirehose} = this.props;

    updateQueryParam('viewAs', viewType);

    changeViewType(viewType, isAsync);

    if (logToFirehose) {
      logToFirehose('toggle_view', {view_type: viewType});
    }
  };

  render() {
    const {viewAs} = this.props;

    return (
      /*{ className used by some code that looks at this element to determine sizing}*/
      <div className="non-scrollable-wrapper" style={styles.main}>
        <div style={styles.viewAs}>{commonMsg.viewPageAs()}</div>
        <div style={styles.toggleGroup}>
          <ToggleGroup selected={viewAs} onChange={this.onChange}>
            <button
              type="button"
              className="uitest-viewAsStudent"
              value={ViewType.Participant}
            >
              {commonMsg.student()}
            </button>
            <button
              type="button"
              className="uitest-viewAsTeacher"
              value={ViewType.Instructor}
            >
              {commonMsg.teacher()}
            </button>
          </ToggleGroup>
        </div>
      </div>
    );
  }
}

const styles = {
  main: {
    textAlign: 'center',
  },
  viewAs: {
    fontSize: 16,
    margin: 10,
  },
  toggleGroup: {
    margin: 10,
  },
};
export const UnconnectedViewAsToggle = ViewAsToggle;
export default connect(
  state => ({
    viewAs: state.viewAs,
  }),
  dispatch => ({
    changeViewType(viewAs, isAsync) {
      if (viewAs === ViewType.Participant) {
        dispatch(setViewAsUserId(null));
      }
      dispatch(changeViewType(viewAs, isAsync));
    },
  })
)(UnconnectedViewAsToggle);
