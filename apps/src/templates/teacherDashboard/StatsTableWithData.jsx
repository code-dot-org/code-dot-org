import React, {Component, PropTypes} from 'react';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import StatsTable from './StatsTable';

class StatsTableWithData extends Component {
  static propTypes = {
    sectionId: PropTypes.string,
  };

  state = {
    studentsCompletedLevelCount: {},
    section: {},
    isLoading: true
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

    const sectionUrl = `/api/v1/sections/${this.props.sectionId}`;
    $.ajax({
      url: sectionUrl,
      method: 'GET',
      dataType: 'json'
    }).done(section => {
      this.setState({
        section: section,
        isLoading: false
      });
    });
  }

  render() {
    return (
      <div>
        {this.state.isLoading &&
          <Spinner/>
        }
        {!this.state.isLoading &&
          <StatsTable
            section={this.state.section}
            studentsCompletedLevelCount={this.state.studentsCompletedLevelCount}
          />
        }
      </div>
    );
  }
}

export default StatsTableWithData;
