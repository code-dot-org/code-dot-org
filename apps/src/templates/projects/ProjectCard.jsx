import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import i18n from '@cdo/locale';
import {studio} from '@cdo/apps/lib/util/urlHelpers';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

import {UnlocalizedTimeAgo} from '../TimeAgo';

export default class ProjectCard extends React.Component {
  static propTypes = {
    projectData: PropTypes.object.isRequired,
    currentGallery: PropTypes.oneOf(['personal', 'public']).isRequired,
    showFullThumbnail: PropTypes.bool,
    isDetailView: PropTypes.bool
  };

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

    const shouldShowPublicDetails =
      isPublicGallery && isDetailView && projectData.publishedAt;
    const noTimeOnCardStyle = shouldShowPublicDetails ? {} : styles.noTime;

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
            href={studio(url)}
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
          {shouldShowPublicDetails && !projectData.isFeatured && (
            <div style={styles.lastEdit}>
              {i18n.published()}:&nbsp;
              <UnlocalizedTimeAgo
                style={styles.bold}
                dateString={projectData.publishedAt}
              />
            </div>
          )}
          {shouldShowPublicDetails && projectData.isFeatured && (
            <div style={styles.lastEdit}>
              <span style={styles.bold}>{i18n.featuredProject()}</span>
            </div>
          )}
          {isPersonalGallery && projectData.updatedAt && (
            <div style={styles.lastEdit}>
              {i18n.projectLastUpdated()}:&nbsp;
              <UnlocalizedTimeAgo
                style={styles.bold}
                dateString={projectData.updatedAt}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

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
    paddingLeft: 30,
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
    paddingRight: 15,
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
