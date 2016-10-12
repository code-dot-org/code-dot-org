import React from 'react';
import { connect } from 'react-redux';
import commonMsg from '@cdo/locale';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import { ViewType, setViewType } from '../../stageLockRedux';

const styles = {
  main: {
    textAlign: 'center'
  },
  viewAs: {
    fontSize: 16,
    margin: 10
  },
  toggleGroup: {
    margin: 10,
  },
};

const ViewAsToggle = React.createClass({
  propTypes: {
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
    setViewType: React.PropTypes.func.isRequired,
  },

  render() {
    const { viewAs, setViewType } = this.props;

    return (
      /*{ className used by some code that looks at this element to determine sizing}*/
      <div className="non-scrollable-wrapper" style={styles.main}>
        <div style={styles.viewAs}>
          {commonMsg.viewPageAs()}
        </div>
        <div style={styles.toggleGroup}>
          <ToggleGroup
            selected={viewAs}
            onChange={setViewType}
          >
            <button value={ViewType.Student}>{commonMsg.student()}</button>
            <button value={ViewType.Teacher}>{commonMsg.teacher()}</button>
          </ToggleGroup>
        </div>
      </div>
    );
  }
});

export default connect(state => ({
  viewAs: state.stageLock.viewAs
}), dispatch => ({
  setViewType(viewAs) {
    dispatch(setViewType(viewAs));
  }
}))(ViewAsToggle);
