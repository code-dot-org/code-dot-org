import React from 'react';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';

const styles = {
  card: {
    border: '1px solid lightGray',
    borderRadius: 2,
    width: 215
  },
  title: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    backgroundColor: color.white,
    color: color.gray
  },
  lastEdit: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    fontSize: 10,
    fontFamily: '"Gotham", sans-serif',
    backgroundColor: color.white,
    color: color.gray
  },
  studentName: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    fontSize: 12,
    fontFamily: '"Gotham 5r", sans-serif',
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
    width: 180,
    padding: 10,
    fontSize: 12,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.light_gray,
    border: '1px solid gray',
    borderRadius: 2,
    backgroundColor: color.white,
    boxShadow: "3px 3px 3px lightGray",
    marginTop: 5,
    position: "absolute"
  },
  delete: {
    color: color.red,
    borderTop: '2px solid lightGray',
    paddingTop: 10,
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
    return date.toLocaleTimeString();
  },

  renderStudentName() {
    // The student's name should only be visible in the classroom gallery.
    if (this.props.currentGallery === 'class'){
      return (
        <div style={styles.studentName}>
          By {this.props.projectData.studentName}
        </div>
      );
    }
  },

  renderArrowIcon() {
    // Only the student can access the menu options when viewing their personal projects.
   if (this.props.currentGallery === 'personal' && !this.state.actionsOpen){
     return (
       <FontAwesome icon=" fa-chevron-down" style={styles.arrowIcon} onClick={this.toggleActionBox}/>
      );
    }
    if (this.props.currentGallery === 'personal' && this.state.actionsOpen){
      return (
        <FontAwesome icon=" fa-chevron-up" style={styles.arrowIcon} onClick={this.toggleActionBox}/>
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
          <h5>Rename</h5>
          <h5>Remix</h5>
          <h5>Share</h5>
          {this.classPublishAction()}
          {this.publicPublishAction()}
          <h5 style={styles.delete}><FontAwesome icon=" fa-times-circle"/> Delete Project</h5>
        </div>
      );
    }
  },

  classPublishAction() {
    if (this.props.projectData.publishedToClass) {
      return (
        <h5> Remove from Class Gallery</h5>
      );
    }
    return (
      <h5> Publish to Class Gallery</h5>
    );
  },

  publicPublishAction() {
    if (this.props.projectData.publishedToPublic) {
      return (
        <h5> Remove from Public Gallery</h5>
      );
    }
    return (
      <h5> Publish to Public Gallery</h5>
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
