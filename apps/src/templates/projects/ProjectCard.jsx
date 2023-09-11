/* eslint-disable react/jsx-no-target-blank */
import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import i18n from '@cdo/locale';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import style from './project-card.module.scss';
import GalleryReportAbusePopUp from './GalleryReportAbusePopUp.jsx';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

import {UnlocalizedTimeAgo} from '../TimeAgo';

export default class ProjectCard extends React.Component {
  static propTypes = {
    projectData: PropTypes.object.isRequired,
    currentGallery: PropTypes.oneOf(['personal', 'public']).isRequired,
    showFullThumbnail: PropTypes.bool,
    isDetailView: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      showReportAbuse: false,
      showReportHeader: false, // may need to change this state in the future to utilize report cookies - if gallery ever keeps an immediate report
    };
    this.showReportAbusePopUp = this.showReportAbusePopUp.bind(this);
    this.closeReportAbusePopUp = this.closeReportAbusePopUp.bind(this);
    this.showReportedHeader = this.showReportedHeader.bind(this);
  }

  showReportAbusePopUp() {
    this.setState({
      showReportAbuse: true,
    });
  }

  closeReportAbusePopUp() {
    this.setState({
      showReportAbuse: false,
    });
  }

  showReportedHeader() {
    this.setState({
      showReportHeader: true,
    });
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

    const shouldShowPublicDetails =
      isPublicGallery && isDetailView && projectData.publishedAt;
    const noTimeOnCardStyle = shouldShowPublicDetails ? {} : styles.noTime;

    const {showReportAbuse, showReportHeader} = this.state;

    return (
      <div className="project_card">
        {showReportAbuse ? (
          <GalleryReportAbusePopUp
            abuseUrl={url}
            projectData={this.props.projectData}
            onClose={this.closeReportAbusePopUp}
            onReport={this.showReportedHeader}
          />
        ) : null}

        <div className={style.card}>
          {!showReportHeader ? (
            <div
              style={{
                ...thumbnailStyle,
                ...styles.header,
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={this.showReportAbusePopUp}
                className={style.cautionButton}
              >
                <FontAwesome
                  icon="circle-exclamation"
                  className={style.cautionIcon}
                />
              </button>
            </div>
          ) : (
            <div
              style={{
                ...thumbnailStyle,
                ...styles.header,
                justifyContent: 'center',
              }}
            >
              <p className={style.reported}>{i18n.reported()}</p>
            </div>
          )}

          <div style={thumbnailStyle}>
            <a
              href={studio(url)}
              style={{width: '100%'}}
              target={isPublicGallery ? '_blank' : undefined}
            >
              <img
                src={projectData.thumbnailUrl || PROJECT_DEFAULT_IMAGE}
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
    fontFamily: '"Gotham 5r", sans-serif',
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
    height: 150,
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
