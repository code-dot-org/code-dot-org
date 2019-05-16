import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import i18n from '@cdo/locale';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import $ from 'jquery';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

const styles = {
  card: {
    border: '1px solid #bbbbbb',
    borderRadius: 2,
    width: 214,
    backgroundColor: color.white
  },
  title: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingTop: 18,
    paddingBottom: 5,
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    height: 18,
    boxSizing: 'content-box'
  },
  titleLink: {
    color: color.charcoal
  },
  lastEdit: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingBottom: 10,
    fontSize: 11,
    fontFamily: '"Gotham", sans-serif',
    color: color.charcoal
  },
  ageRange: {
    paddingLeft: 10,
    paddingTop: 5,
    fontSize: 11,
    fontFamily: '"Gotham", sans-serif',
    color: color.charcoal
  },
  firstInitial: {
    paddingTop: 5,
    fontSize: 11,
    paddingLeft: 15,
    fontFamily: '"Gotham", sans-serif',
    color: color.charcoal
  },
  thumbnail: {
    width: 214,
    height: 150,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  fullThumbnail: {
    height: 214
  },
  image: {
    flexShrink: 0,
    width: '100%',
    weight: '100%'
  },
  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  noTime: {
    paddingBottom: 10
  }
};

export default class ProjectCard extends React.Component {
  static propTypes = {
    projectData: PropTypes.object.isRequired,
    currentGallery: PropTypes.oneOf(['personal', 'public']).isRequired,
    showFullThumbnail: PropTypes.bool,
    isDetailView: PropTypes.bool
  };

  getLastModifiedTimestamp(timestamp) {
    if (timestamp.toLocaleString) {
      return timestamp.toLocaleString();
    }
    return timestamp.toString();
  }

  componentDidMount() {
    if ($('.versionTimestamp').timeago) {
      $('.versionTimestamp').timeago();
    }
  }

  render() {
    const {projectData, currentGallery, isDetailView} = this.props;
    const {type, channel} = this.props.projectData;
    const isPersonalGallery = currentGallery === 'personal';
    const isPublicGallery = currentGallery === 'public';
    const url = isPersonalGallery
      ? `/projects/${type}/${channel}/edit`
      : `/projects/${type}/${channel}`;

    const thumbnailStyle = styles.thumbnail;
    if (this.props.showFullThumbnail) {
      Object.assign(thumbnailStyle, styles.fullThumbnail);
    }

    const shouldShowPublishedAt =
      isPublicGallery && isDetailView && projectData.publishedAt;
    const noTimeOnCardStyle = shouldShowPublishedAt ? {} : styles.noTime;

    return (
      <div className="project_card">
        <div style={styles.card}>
          <div style={thumbnailStyle}>
            <a
              href={studio(url)}
              style={{width: '100%'}}
              target={isPublicGallery ? '_blank' : undefined}
            >
              <img
                src={projectData.thumbnailUrl || PROJECT_DEFAULT_IMAGE}
                style={styles.image}
              />
            </a>
          </div>
          <a
            style={styles.titleLink}
            href={url}
            target={isPublicGallery ? '_blank' : undefined}
          >
            <div
              style={styles.title}
              className={`ui-project-name-${projectData.type}`}
            >
              {projectData.name}
            </div>
          </a>
          <div style={noTimeOnCardStyle}>
            {isPublicGallery && projectData.studentName && (
              <span style={styles.firstInitial}>
                {i18n.by()}:&nbsp;
                <span style={styles.bold}>{projectData.studentName}</span>
              </span>
            )}
            {isPublicGallery && projectData.studentAgeRange && (
              <span style={styles.ageRange}>
                {i18n.age()}:&nbsp;
                <span style={styles.bold}>{projectData.studentAgeRange}</span>
              </span>
            )}
          </div>
          {shouldShowPublishedAt && (
            <div style={styles.lastEdit}>
              {i18n.published()}:&nbsp;
              <time
                style={styles.bold}
                className="versionTimestamp"
                dateTime={projectData.publishedAt}
              >
                {this.getLastModifiedTimestamp(projectData.publishedAt)}
              </time>
            </div>
          )}
          {isPersonalGallery && projectData.updatedAt && (
            <div style={styles.lastEdit}>
              {i18n.projectLastUpdated()}:&nbsp;
              <time
                style={styles.bold}
                className="versionTimestamp"
                dateTime={projectData.updatedAt}
              >
                {this.getLastModifiedTimestamp(projectData.updatedAt)}
              </time>
            </div>
          )}
        </div>
      </div>
    );
  }
}
