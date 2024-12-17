/* eslint-disable react/jsx-no-target-blank */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {studio} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

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

    const shouldShowPublicDetails =
      isPublicGallery && isDetailView && projectData.publishedAt;

    return (
      <div className={style.card}>
        <a
          className={style.link}
          href={studio(url)}
          target={isPublicGallery ? '_blank' : undefined}
        >
          <div
            className={classNames(style.thumbnail, {
              [style.fullThumbnail]: this.props.showFullThumbnail,
            })}
          >
            <img
              src={getProjectCardImageUrl(projectData.thumbnailUrl, type)}
              alt={i18n.projectThumbnail()}
            />
          </div>

          <div
            className={classNames(
              style.title,
              `ui-project-name-${projectData.type}`
            )}
          >
            {projectData.name}
          </div>

          <div
            className={classNames({
              [style.noTime]: !shouldShowPublicDetails,
            })}
          >
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
        </a>
      </div>
    );
  }
}
