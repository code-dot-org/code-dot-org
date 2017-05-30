import React from 'react';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import i18n from "@cdo/locale";
import $ from 'jquery';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

const styles = {
  card: {
    border: '1px solid #bbbbbb',
    borderRadius: 2,
    width: 220,
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
  studentName: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingTop: 5,
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
  arrowIcon: {
    paddingRight: 8
  },
  thumbnail: {
    width: 220,
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
  actionBox: {
    width: 160,
    paddingLeft: 15,
    paddingRight: 15,
    border: '1px solid #bbbbbb',
    borderRadius: 2,
    backgroundColor: color.white,
    boxShadow: "3px 3px 3px gray",
    marginTop: 5,
    position: "absolute"
  },
  actionText: {
    fontSize: 11,
    fontFamily: '"Gotham", sans-serif',
    color: color.gray
  },
  delete: {
    color: color.red,
    borderTop: '1px solid lightGray',
    paddingTop: 10,
    fontSize: 11
  },
  xIcon: {
    paddingRight: 5
  },
  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  }
};

const ProjectCard = React.createClass({
  propTypes: {
    projectData: React.PropTypes.object.isRequired,
    currentGallery: React.PropTypes.string.isRequired,
  },

  getInitialState() {
   return {actionsOpen: false};
  },

  dateFormatter(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  },

  timeFormatter(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  },

  renderStudentName() {
  // The student's name should only be visible in the classroom gallery.
    if (this.props.currentGallery === 'class'){
      return this.props.projectData.studentName && (
        <div style={styles.studentName}>
          {i18n.by()}:
          <span style={styles.bold} > {this.props.projectData.studentName}</span>
        </div>
      );
    }
  },

  renderFirstInitial() {
    if (this.props.currentGallery === 'public'){
      // The server provides only a single letter for the student name in the
      // public gallery for privacy reasons.
      return this.props.projectData.studentName && (
          <span style={styles.firstInitial}>
          {i18n.by()}:
          <span style={styles.bold} > {this.props.projectData.studentName}</span>
        </span>
        );
    }
  },

  renderStudentAgeRange(studentAgeRange) {
  // The student's age range should only be visible in the public gallery.
    if (this.props.currentGallery === 'public') {
      return studentAgeRange && (
        <span style={styles.ageRange}>
          {i18n.age()}:
          <span style={styles.bold} > {studentAgeRange}</span>
        </span>
      );
    }
  },

  renderArrowIcon() {
  // Only the student can access the menu options when viewing their personal projects.
    if (this.props.currentGallery === 'personal') {
     let icon = this.state.actionsOpen ? 'chevron-up' : 'chevron-down';
     return (
       <FontAwesome icon={icon} style={styles.arrowIcon} onClick={this.toggleActionBox}/>
      );
    }
  },

  toggleActionBox() {
    this.setState({actionsOpen: !this.state.actionsOpen});
  },

  checkIfPublished() {
    let actions = [i18n.rename(), i18n.remix(), i18n.share()];

    this.props.projectData.publishedToClass ?
    actions.push(i18n.removeFromClassGallery()) :
    actions.push(i18n.publishToClassGallery());

    this.props.projectData.publishedToPublic ?
    actions.push(i18n.removeFromPublicGallery()) : actions.push(i18n.publishToPublicGallery());
    return actions;
  },

  renderActionBox(actions) {
    if (this.state.actionsOpen) {
      return (
        <div style={styles.actionBox}>
          {actions.map((action, index) => (
            <h5 key={index} style={styles.actionText}>
              {action}
            </h5>
          ))}
          <h5 style={styles.delete}>
            <FontAwesome icon=" fa-times-circle" style={styles.xIcon}/>
            {i18n.deleteProject()}
          </h5>
        </div>
      );
    }
  },

  renderProjectName(url, name) {
    return (
      <a style={styles.titleLink} href={url}>
        <div style={styles.title}>{name}</div>
      </a>
    );
  },

  getLastModifiedTimestamp: function (timestamp) {
    if (timestamp.toLocaleString) {
      return timestamp.toLocaleString();
    }
    return timestamp.toString();
  },

  render() {
    const { projectData } = this.props;

    const {type, channel, name} = this.props.projectData;
    const url = `/projects/${type}/${channel}`;

    return (
      <div>
        <div style={styles.card}>
          <div style={styles.thumbnail} >
            <a href={url} style={{width: '100%'}}>
              <img
                src={projectData.thumbnailUrl || PROJECT_DEFAULT_IMAGE}
                style={styles.image}
              />
            </a>
          </div>

          {this.renderProjectName(url, name)}

          {this.renderStudentName()}

          <span>
            {this.renderFirstInitial()}
            {this.renderStudentAgeRange(projectData.studentAgeRange)}
          </span>

          <div style={styles.lastEdit}>
            {this.renderArrowIcon()}
            {i18n.published()}:&nbsp;
            <time style={styles.bold} className="versionTimestamp" dateTime={projectData.publishedAt}> {this.getLastModifiedTimestamp(projectData.publishedAt)}</time>
          </div>
        </div>

        {this.renderActionBox(this.checkIfPublished())}

      </div>
    );
  },

  componentDidMount: function () {
    if ($('.versionTimestamp').timeago) {
      $('.versionTimestamp').timeago();
    }
  }
});

export default ProjectCard;
