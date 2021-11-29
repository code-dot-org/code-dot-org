import PropTypes from 'prop-types';
import React from 'react';
import ProjectCard from './ProjectCard';

const projectProp = PropTypes.shape({
  channel: PropTypes.string.isRequired,

  thumbnailUrl: PropTypes.string,
  name: PropTypes.string,
  publishedAt: PropTypes.date,
  studentAgeRange: PropTypes.string,
  studentName: PropTypes.string,
  type: PropTypes.string,
  updatedAt: PropTypes.date
});

export default class ProjectCardRow extends React.Component {
  static propTypes = {
    projects: PropTypes.arrayOf(projectProp).isRequired,
    galleryType: PropTypes.oneOf(['personal', 'public']).isRequired,
    showFullThumbnail: PropTypes.bool,
    isDetailView: PropTypes.bool
  };

  render() {
    return (
      <div style={styles.row}>
        {this.props.projects.map(project => (
          <div key={project.channel} style={styles.card}>
            <ProjectCard
              projectData={project}
              showFullThumbnail={this.props.showFullThumbnail}
              currentGallery={this.props.galleryType}
              isDetailView={this.props.isDetailView}
            />
          </div>
        ))}
      </div>
    );
  }
}

const styles = {
  card: {
    display: 'inline-block',
    paddingTop: 10,
    paddingBottom: 20
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  }
};
