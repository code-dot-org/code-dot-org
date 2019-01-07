import React, {Component, PropTypes} from 'react';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import SectionProjectsList from './SectionProjectsList';

class SectionProjectsListWithData extends Component {
  static propTypes = {
    sectionId: PropTypes.string,
    studioUrlPrefix: PropTypes.string
  };

  state = {
    projectsData: {},
    isLoading: true
  };

  componentDidMount() {
    const projectsDataUrl = `/dashboardapi/v1/projects/section/${this.props.sectionId}`;
    $.ajax({
      url: projectsDataUrl,
      method: 'GET',
      dataType: 'json'
    }).done(projectsData => {
      this.setState({
        projectsData: projectsData,
        isLoading: false
      });
    });
  }

  render() {
    const {studioUrlPrefix} = this.props;
    const {projectsData} = this.state;

    return (
      <div>
        {this.state.isLoading &&
          <Spinner/>
        }
        {!this.state.isLoading &&
          <SectionProjectsList
            projectsData={projectsData}
            studioUrlPrefix={studioUrlPrefix}
            showProjectThumbnails={true}
          />
        }
      </div>
    );
  }
}

export default SectionProjectsListWithData;
