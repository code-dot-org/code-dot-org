import React, {PropTypes} from 'react';
import color from "../../util/color";
import i18n from "@cdo/locale";
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
    height: 18
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
  image:{
    flexShrink: 0,
    minWidth: '100%',
    minHeight: '100%'
  },
  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
};

export default class ProjectCard extends React.Component {
  static propTypes = {
    projectData: PropTypes.object.isRequired,
    currentGallery: PropTypes.oneOf(['personal', 'public']).isRequired,
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
    const { projectData, currentGallery } = this.props;
    const { type, channel } = this.props.projectData;
    const isPersonalGallery = currentGallery === 'personal';
    const isPublicGallery = currentGallery === 'public';
    const url = isPersonalGallery ? `/projects/${type}/${channel}/edit` : `/projects/${type}/${channel}`;

    return (
      <div className="project_card">
        <div style={styles.card}>
          <div style={styles.thumbnail} >
            <a
              href={url}
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
              className="ui-project-name"
            >
              {projectData.name}
            </div>
          </a>
          <span>
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
          </span>
          {isPublicGallery && (
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
          {isPersonalGallery && (
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
