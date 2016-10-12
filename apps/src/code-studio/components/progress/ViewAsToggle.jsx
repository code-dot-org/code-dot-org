import React from 'react';
import commonMsg from '@cdo/locale';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import { ViewType } from '../../stageLockRedux';

const styles = {
  toggleGroup: {
    margin: 10,
    textAlign: 'center'
  },
};

const ViewAsToggle = ({viewAs, setViewType}) => (
  <div className="non-scrollable-wrapper">
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
ViewAsToggle.propTypes = {
  viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
  setViewType: React.PropTypes.func.isRequired,
};

export default ViewAsToggle;
