import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import ManageStudentsTable from './ManageStudentsTable';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';

class ManageStudents extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string,

    // Provided by redux
    sectionId: PropTypes.number,
  };

  render() {
    const {sectionId, studioUrlPrefix} = this.props;

    return (
      <div>
        <SyncOmniAuthSectionControl sectionId={sectionId}/>
        <ManageStudentsTable studioUrlPrefix={studioUrlPrefix}/>
      </div>
    );
  }
}

export const UnconnectedManageStudents = ManageStudents;

export default connect(state => ({
  sectionId: state.sectionData.section.id,
}))(ManageStudents);
