import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ManageStudentsTable from './ManageStudentsTable';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';

class ManageStudents extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string,
    pegasusUrlPrefix: PropTypes.string,

    // Provided by redux
    sectionId: PropTypes.number
  };

  render() {
    const {sectionId, studioUrlPrefix, pegasusUrlPrefix} = this.props;

    return (
      <div>
        <SyncOmniAuthSectionControl sectionId={sectionId} />
        <ManageStudentsTable
          studioUrlPrefix={studioUrlPrefix}
          pegasusUrlPrefix={pegasusUrlPrefix}
        />
      </div>
    );
  }
}

export const UnconnectedManageStudents = ManageStudents;

export default connect(state => ({
  sectionId: state.sectionData.section.id
}))(ManageStudents);
