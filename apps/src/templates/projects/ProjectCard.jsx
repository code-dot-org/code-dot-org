import React from 'react';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';

const styles = {
  card: {
    border: '2px solid gray',
    borderRadius: 2,
    width: 250
  },
  title: {
    padding: 10,
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    backgroundColor: color.teal,
    color: color.white
  },
  lastEdit: {
    padding: 10,
    fontSize: 12,
    fontFamily: '"Gotham", sans-serif',
    backgroundColor: color.lightest_gray
  },
  studentName: {
    padding: 10,
    fontSize: 14,
    fontFamily: '"Gotham 5r", sans-serif',
    backgroundColor: color.lightest_gray
  },
  downIcon: {
    paddingRight: 8
  },
  thumbnail: {
    width: 250
  }
};

const ProjectCard = React.createClass({
  propTypes: {
    projectData: React.PropTypes,
    currentGallery: React.PropTypes.string,
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
    //the student's name should only be visible in the classroom gallery
    if (this.props.currentGallery === 'classroom'){
      return (
        <div style={styles.studentName}>
          {this.props.projectData.studentName}
        </div>
      );
    }
  },

  renderDownIcon() {
    //Only the student can access the menu options when viewing their personal projects
   if (this.props.currentGallery === 'personal'){
     return (
       <FontAwesome icon=" fa-chevron-down" style={styles.downIcon}/>
      );
    }
  },

  render() {
    return (
      <div style={styles.card}>
        <img src={require('./placeholder.png')} style={styles.thumbnail} />
         <div style={styles.title}>
           {this.props.projectData.projectName}
         </div>

         {this.renderStudentName()}

         <div style={styles.lastEdit}>
           {this.renderDownIcon()}
           Last edited: {this.dateFormatter(this.props.projectData.updatedAt)} at {this.timeFormatter(this.props.projectData.updatedAt)}
         </div>

      </div>


    );
  }
});

export default ProjectCard;
