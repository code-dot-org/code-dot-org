import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import StatsTable from './StatsTable';
import {LoadingStatus} from '@cdo/apps/redux/sectionDataRedux';
import {getStudentsCompletedLevelCount} from './statsRedux';

class StatsTableWithData extends Component {
  static propTypes = {
    // Props provided by redux.
    section: PropTypes.object,
    sectionLoadingStatus: PropTypes.string,
    studentsCompletedLevelCount: PropTypes.object,
  };

  render() {
    const {section, sectionLoadingStatus, studentsCompletedLevelCount} = this.props;

    return (
      <div>
        {(!sectionLoadingStatus || sectionLoadingStatus === LoadingStatus.IN_PROGRESS) &&
          <Spinner/>
        }
        {sectionLoadingStatus === LoadingStatus.SUCCESS &&
          <StatsTable
            section={section}
            studentsCompletedLevelCount={studentsCompletedLevelCount}
          />
        }
        {sectionLoadingStatus === LoadingStatus.FAIL &&
          <div>{i18n.statsTableFailure()}</div>
        }
      </div>
    );
  }
}

export const UnconnectedStatsTableWithData = StatsTableWithData;

export default connect(state => ({
  section: state.sectionData.section,
  sectionLoadingStatus: state.sectionData.loadingStatus,
  studentsCompletedLevelCount: getStudentsCompletedLevelCount(state, state.sectionData.section.id),
}))(StatsTableWithData);
