import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import StatsTable from './StatsTable';
import {LoadingStatus} from '@cdo/apps/redux/sectionDataRedux';

class StatsTableWithData extends Component {
  static propTypes = {
    // Props provided by redux.
    section: PropTypes.object,
    loadingStatus: PropTypes.string,
  };

  state = {
    studentsCompletedLevelCount: {},
  };

  componentDidMount() {
    const {section} = this.props;
    if (section.id) {
      const completedLevelsUrl = `/dashboardapi/sections/${section.id}/students/completed_levels_count`;
      $.ajax({
        url: completedLevelsUrl,
        method: 'GET',
        dataType: 'json'
      }).done(studentsCompletedLevelCount => {
        this.setState({studentsCompletedLevelCount: studentsCompletedLevelCount});
      });
    }
  }

  render() {
    const {section, loadingStatus} = this.props;

    return (
      <div>
        {(!loadingStatus || loadingStatus === LoadingStatus.IN_PROGRESS) &&
          <Spinner/>
        }
        {loadingStatus === LoadingStatus.SUCCESS &&
          <StatsTable
            section={section}
            studentsCompletedLevelCount={this.state.studentsCompletedLevelCount}
          />
        }
        {loadingStatus === LoadingStatus.FAIL &&
          <div>{i18n.statsTableFailure()}</div>
        }
      </div>
    );
  }
}

export const UnconnectedStatsTableWithData = StatsTableWithData;

export default connect(state => ({
  section: state.sectionData.section,
  loadingStatus: state.sectionData.loadingStatus,
}))(StatsTableWithData);
