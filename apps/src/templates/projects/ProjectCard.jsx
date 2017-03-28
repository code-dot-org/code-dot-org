import React from 'react';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';

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
    projectData: React.PropTypes,
    currentGallery: React.PropTypes.string,
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
      return (
        <div style={styles.studentName}>
          By: {this.props.projectData.studentName}
        </div>
      );
    }
  },

  renderFirstInitial() {
    if (this.props.currentGallery === 'public'){
      return (
        <span style={styles.firstInitial}>
          By: {this.props.projectData.studentName[0]}
        </span>
      );
    }
  },

  renderStudentAgeRange() {
    // The student's age range should only be visible in the public gallery.
    if (this.props.currentGallery === 'public'){
      if (this.props.projectData.studentAge >= 18){
        return (
          <span style={styles.ageRange}>
            Age: 18+
          </span>
        );
      }
      if (this.props.projectData.studentAge >= 13){
        return (
          <span style={styles.ageRange}>
            Age: 13+
          </span>
        );
      }
      if (this.props.projectData.studentAge >= 8){
        return (
          <span style={styles.ageRange}>
            Age: 8+
          </span>
        );
      }
      if (this.props.projectData.studentAge >= 4){
        return (
          <span style={styles.ageRange}>
            Age: 4+
          </span>
        );
      }
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

  renderActionBox() {
    if (this.state.actionsOpen) {
      return (
        <div style={styles.actionBox}>
          <h5 style={styles.actionText}>
            Rename
          </h5>
          <h5 style={styles.actionText}>
            Remix
          </h5>
          <h5 style={styles.actionText}>
            Share
          </h5>
          {this.classPublishAction()}
          {this.publicPublishAction()}
          <h5 style={styles.delete}>
            <FontAwesome icon=" fa-times-circle" style={styles.xIcon}/>
            Delete Project
          </h5>
        </div>
      );
    }
  },

  classPublishAction() {
    if (this.props.projectData.publishedToClass) {
      return (
        <h5 style={styles.actionText}> Remove from Class Gallery</h5>
      );
    }
    return (
      <h5 style={styles.actionText}> Publish to Class Gallery</h5>
    );
  },

  publicPublishAction() {
    if (this.props.projectData.publishedToPublic) {
      return (
        <h5 style={styles.actionText}> Remove from Public Gallery</h5>
      );
    }
    return (
      <h5 style={styles.actionText}> Publish to Public Gallery</h5>
    );
  },

  render() {
    return (
      <div>
        <div style={styles.card}>
          <img src={require('./placeholder.jpg')} style={styles.thumbnail} />

          <div style={styles.title}>
            {this.props.projectData.projectName}
          </div>

          {this.renderStudentName()}

          <span>
            {this.renderFirstInitial()}
            {this.renderStudentAgeRange()}
          </span>

          <div style={styles.lastEdit}>
            {this.renderArrowIcon()}
            Last edited: {this.dateFormatter(this.props.projectData.updatedAt)} at {this.timeFormatter(this.props.projectData.updatedAt)}
          </div>
        </div>

        {this.renderActionBox()}

      </div>
    );
  }
});

export default ProjectCard;
