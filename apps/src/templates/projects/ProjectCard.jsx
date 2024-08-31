/* eslint-disable react/jsx-no-target-blank */
import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

import color from '../../util/color';
import {UnlocalizedTimeAgo} from '../TimeAgo';

import {getProjectCardImageUrl} from './projectUtils';

import style from './project-card.module.scss';

export default class ProjectCard extends React.Component {
  static propTypes = {
    projectData: PropTypes.object.isRequired,
    currentGallery: PropTypes.oneOf(['personal', 'public']).isRequired,
    showFullThumbnail: PropTypes.bool,
    isDetailView: PropTypes.bool,
    showReportAbuseHeader: PropTypes.bool,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {projectData, currentGallery, isDetailView} = this.props;
    const {type, channel} = this.props.projectData;
    const isPersonalGallery = currentGallery === 'personal';
    const isPublicGallery = currentGallery === 'public';
    const url = isPersonalGallery
      ? `/projects/${type}/${channel}/edit`
      : `/projects/${type}/${channel}`;

    let thumbnailStyle = styles.thumbnail;
    if (this.props.showFullThumbnail) {
      thumbnailStyle = {...thumbnailStyle, ...styles.fullThumbnail};
    }

    const shouldShowPublicDetails =
      isPublicGallery && isDetailView && projectData.publishedAt;
    const noTimeOnCardStyle = shouldShowPublicDetails ? {} : styles.noTime;

    return (
      <div className="project_card">
        <div className={style.card}>
          <div style={thumbnailStyle}>
            <a
              href={studio(url)}
              style={{width: '100%'}}
              target={isPublicGallery ? '_blank' : undefined}
            >
              <img
                src={getProjectCardImageUrl(projectData.thumbnailUrl, type)}
                className={style.image}
                alt={i18n.projectThumbnail()}
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
              <span className={style.firstInitial}>
                {i18n.by()}:&nbsp;
                <span className={style.bold}>{projectData.studentName}</span>
              </span>
            )}
            {isPublicGallery && projectData.studentAgeRange && (
              <span className={style.ageRange}>
                {i18n.age()}:&nbsp;
                <span className={style.bold}>
                  {projectData.studentAgeRange}
                </span>
              </span>
            )}
          </div>
          {shouldShowPublicDetails && !projectData.isFeatured && (
            <div className={style.lastEdit}>
              {i18n.published()}:&nbsp;
              <UnlocalizedTimeAgo
                className={style.bold}
                dateString={projectData.publishedAt}
              />
            </div>
          )}
          {shouldShowPublicDetails && projectData.isFeatured && (
            <div className={style.lastEdit}>
              <span className={style.bold}>{i18n.featuredProject()}</span>
            </div>
          )}
          {isPersonalGallery && projectData.updatedAt && (
            <div className={style.lastEdit}>
              {i18n.projectLastUpdated()}:&nbsp;
              <UnlocalizedTimeAgo
                dateString={projectData.updatedAt}
                className={style.bold}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  title: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingTop: 18,
    paddingBottom: 5,
    fontSize: 16,
    ...fontConstants['main-font-semi-bold'],
    color: color.neutral_dark,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    height: 18,
    boxSizing: 'content-box',
  },
  titleLink: {
    color: color.neutral_dark,
    textDecoration: 'none',
  },
  thumbnail: {
    width: 214,
    height: 170,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fullThumbnail: {
    height: 214,
  },
  noTime: {
    paddingBottom: 10,
  },
  checkboxSpan: {
    flex: '1',
    verticalAlign: 'middle',
  },
  header: {
    height: 40,
    display: 'flex',
    alignItems: 'center',
  },
};
