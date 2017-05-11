import React, {PropTypes} from 'react';
import ProjectAppTypeArea from './ProjectAppTypeArea.jsx';
import {projectPropType} from './projectConstants';
import i18n from "@cdo/locale";

const styles = {
  grid: {
    padding: 10,
    width: 1000
  }
};

const ProjectCardGrid = React.createClass({
  propTypes: {
    projectLists: PropTypes.shape({
      applab: PropTypes.arrayOf(projectPropType),
      gamelab: PropTypes.arrayOf(projectPropType),
      playlab: PropTypes.arrayOf(projectPropType),
      artist: PropTypes.arrayOf(projectPropType),
    }).isRequired,
    galleryType: PropTypes.oneOf(['personal', 'class', 'public']).isRequired
  },

  getInitialState() {
    return {
      showAll: true,
      showApp: ''
    };
  },

  onSelectApp(appType) {
    this.setState({showAll: false, showApp: appType});
  },

  viewAllProjects() {
    this.setState({showAll: true, showApp: ''});
  },

  render() {
    const { projectLists } = this.props;
    const numProjects = this.state.showAll ? 4 : 12;

    return (
      <div style={styles.grid}>
        {(this.state.showAll) &&
          <div>
            <ProjectAppTypeArea
              labName={i18n.projectTypeApplab()}
              labViewMoreString="View more App Lab projects"
              projectList={projectLists.applab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
            />
            <ProjectAppTypeArea
              labName={i18n.projectTypeGamelab()}
              labViewMoreString="View more Game Lab projects"
              projectList={projectLists.gamelab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
            />
            <ProjectAppTypeArea
              labName={i18n.projectTypeArtist()}
              labViewMoreString="View more Artist projects"
              projectList={projectLists.artist}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
            />
            <ProjectAppTypeArea
              labName={i18n.projectTypePlaylab()}
              labViewMoreString="View more Play Lab projects"
              projectList={projectLists.playlab}
              numProjectsToShow={numProjects}
              galleryType={this.props.galleryType}
              navigateFunction={this.onSelectApp}
            />
          </div>
        }

        {(!this.state.showAll) &&
          <div>
            {this.state.showApp === 'applab' &&
              <ProjectAppTypeArea
                labName="All App Lab Projects"
                labViewMoreString="View all projects"
                projectList={projectLists.applab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
              />
            }
            {this.state.showApp === 'gamelab' &&
              <ProjectAppTypeArea
                labName="All Game Lab Projects"
                labViewMoreString="View all projects"
                projectList={projectLists.gamelab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
              />
            }
            {this.state.showApp === 'artist' &&
              <ProjectAppTypeArea
                labName="All Artist Projects"
                labViewMoreString="View all projects"
                projectList={projectLists.artist}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
              />
            }
            {this.state.showApp === 'playlab' &&
              <ProjectAppTypeArea
                labName="All Play Lab Projects"
                labViewMoreString="View all projects"
                projectList={projectLists.playlab}
                numProjectsToShow={numProjects}
                galleryType={this.props.galleryType}
                navigateFunction={this.viewAllProjects}
              />
            }
          </div>
        }

      </div>
    );
  }
});

export default ProjectCardGrid;
