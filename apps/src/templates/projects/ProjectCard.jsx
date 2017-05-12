import React from 'react';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import i18n from "@cdo/locale";
import placeholderImage from './placeholder.jpg';

const styles = {
  card: {
    border: '1px solid #bbbbbb',
    borderRadius: 2,
    width: 215,
    backgroundColor: color.white
  },
  title: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    backgroundColor: color.white,
    color: color.gray
  },
  lastEdit: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingBottom: 10,
    fontSize: 12,
    fontFamily: '"Gotham", sans-serif',
    backgroundColor: color.white,
    color: color.gray
  },
  studentName: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingTop: 5,
    fontSize: 12,
    fontFamily: '"Gotham", sans-serif',
    backgroundColor: color.white,
    color: color.gray
  },
  ageRange: {
    paddingLeft: 10,
    paddingTop: 5,
    fontSize: 12,
    fontFamily: '"Gotham", sans-serif',
    backgroundColor: color.white,
    color: color.gray
  },
  firstInitial: {
    paddingTop: 5,
    fontSize: 12,
    paddingLeft: 15,
    fontFamily: '"Gotham", sans-serif',
    backgroundColor: color.white,
    color: color.gray
  },
  arrowIcon: {
    paddingRight: 8
  },
  thumbnail: {
    width: 215,
    height: 150
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
    fontSize: 12,
    fontFamily: '"Gotham", sans-serif',
    color: color.gray
  },
  delete: {
    color: color.red,
    borderTop: '1px solid lightGray',
    paddingTop: 10,
    fontSize: 12
  },
  xIcon: {
    paddingRight: 5
  },
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
          {i18n.by()}: {this.props.projectData.studentName}
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
          {i18n.by()}: {this.props.projectData.studentName}
        </span>
        );
    }
  },

  renderStudentAgeRange(studentAgeRange) {
  // The student's age range should only be visible in the public gallery.
    if (this.props.currentGallery === 'public') {
      return studentAgeRange && (
        <span style={styles.ageRange}>
          {i18n.age()}: {studentAgeRange}
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

  renderProjectName() {
    const {type, channel, name} = this.props.projectData;
    const url = `/projects/${type}/${channel}/view`;
    return <a href={url} target="_blank">{name}</a>;
  },

  render() {
    const { projectData } = this.props;

    return (
      <div>
        <div style={styles.card}>
          <img
            src={projectData.thumbnailUrl || placeholderImage}
            style={styles.thumbnail}
          />

          <div style={styles.title}>
            {this.renderProjectName()}
          </div>

          {this.renderStudentName()}

          <span>
            {this.renderFirstInitial()}
            {this.renderStudentAgeRange(projectData.studentAgeRange)}
          </span>

          <div style={styles.lastEdit}>
            {this.renderArrowIcon()}
            {i18n.published()}: {this.dateFormatter(projectData.publishedAt)} at {this.timeFormatter(projectData.publishedAt)}
          </div>
        </div>

        {this.renderActionBox(this.checkIfPublished())}

      </div>
    );
  }
});

export default ProjectCard;
