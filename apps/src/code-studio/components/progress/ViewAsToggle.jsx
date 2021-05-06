import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import commonMsg from '@cdo/locale';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import {ViewType, changeViewType} from '../../viewAsRedux';
import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';

/**
 * Toggle that lets us change between seeing a page as a teacher, or as the
 * student sees it
 */
class ViewAsToggle extends React.Component {
  static propTypes = {
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    changeViewType: PropTypes.func.isRequired,
    logToFirehose: PropTypes.func
  };

  componentDidMount() {
    // Upon loading, toggle hide-as-student appropriately (this is so that if we
    // load a page with ?viewAs=Student we still hide stuff)
    const {viewAs} = this.props;
    $('.hide-as-student').toggle(viewAs === ViewType.Teacher);
  }

  onChange = viewType => {
    const {changeViewType} = this.props;

    updateQueryParam('viewAs', viewType);

    if (viewType === ViewType.Student && queryParams('user_id')) {
      // In this case, the changeViewType thunk is going to do a reload and we dont
      // want to change our UI.
    } else {
      // Ideally all the things we would want to hide would be redux backed, and
      // would just update automatically. However, we're not in such a world. Instead,
      // explicitly hide or show elements with this class name based on new toggle state.
      $('.hide-as-student').toggle(viewType === ViewType.Teacher);
    }

    changeViewType(viewType);

    if (this.props.logToFirehose) {
      this.props.logToFirehose('toggle_view', {view_type: viewType});
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
              value={ViewType.Student}
            >
              {commonMsg.student()}
            </button>
            <button
              type="button"
              className="uitest-viewAsTeacher"
              value={ViewType.Teacher}
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
    textAlign: 'center'
  },
  viewAs: {
    fontSize: 16,
    margin: 10
  },
  toggleGroup: {
    margin: 10
  }
};
export const UnconnectedViewAsToggle = ViewAsToggle;
export default connect(
  state => ({
    viewAs: state.viewAs
  }),
  dispatch => ({
    changeViewType(viewAs) {
      dispatch(changeViewType(viewAs));
    }
  })
)(UnconnectedViewAsToggle);
