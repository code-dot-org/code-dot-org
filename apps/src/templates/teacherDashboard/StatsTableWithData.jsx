import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import StatsTable from './StatsTable';

class StatsTableWithData extends Component {
  static propTypes = {
    // TODO: remove this!
    sectionId: PropTypes.string,

    // Props provided by redux.
    section: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
  };

  state = {
    studentsCompletedLevelCount: {},
  };

  componentDidMount() {
    const completedLevelsUrl = `/dashboardapi/sections/${this.props.sectionId}/students/completed_levels_count`;
    $.ajax({
      url: completedLevelsUrl,
      method: 'GET',
      dataType: 'json'
    }).done(studentsCompletedLevelCount => {
      this.setState({studentsCompletedLevelCount: studentsCompletedLevelCount});
    });
  }

  render() {
    const {section, isLoading} = this.props;

    return (
      <div>
        {isLoading &&
          <Spinner/>
        }
        {!isLoading &&
          <StatsTable
            section={section}
            studentsCompletedLevelCount={this.state.studentsCompletedLevelCount}
          />
        }
      </div>
    );
  }
}

export const UnconnectedStatsTableWithData = StatsTableWithData;

export default connect(state => ({
  section: state.sectionData.section,
  isLoading: state.sectionData.isLoading,
}))(StatsTableWithData);
