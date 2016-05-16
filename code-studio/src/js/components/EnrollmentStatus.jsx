/*jshint scripturl:true*/

window.dashboard = window.dashboard || {};

var ModuleSection = React.createClass({
  propTypes: {
    moduleType: React.PropTypes.string,
    status: React.PropTypes.string
  },

  render: function () {
    var ribbonClass = 'ribbon ' + this.props.status;
    return (
      <div className="module_assignment">
        {this.props.moduleType}
        <div className="ribbon-wrapper">
          <div className={ribbonClass}/>
        </div>
      </div>
    );
  }
});

var CourseUnitSection = React.createClass({
  propTypes: {
    courseUnit: React.PropTypes.object
  },

  render: function () {
    return (
      <div className="course_unit_section">
        <div className="course_unit_title">
          {this.props.courseUnit['title']}
        </div>

        <ModuleSection moduleType="Overview" status={this.props.courseUnit['status']['required']}/>
        <ModuleSection moduleType="Content" status={this.props.courseUnit['status']['content']}/>
        <ModuleSection moduleType="Practice" status={this.props.courseUnit['status']['practice']}/>
      </div>
    );
  }
});

var CourseUnitSectionRow = React.createClass({
  propTypes: {
    courseUnitAssignments: React.PropTypes.array
  },

  render: function () {
    var courseUnitAssignments = this.props.courseUnitAssignments.map(function (courseUnitAssignment) {
      return <CourseUnitSection courseUnit={courseUnitAssignment}/>;
    });

    return (
      <div className="course_unit_sections">
        {courseUnitAssignments}
      </div>
    );
  }
});

var EnrollmentStatus = React.createClass({
  propTypes: {
    courseTitle: React.PropTypes.string,
    courseUnitSections: React.PropTypes.array
  },

  render: function () {
    var courseUnitSections = this.props.courseUnitSections.map(function (courseUnitAssignments) {
      return <CourseUnitSectionRow courseUnitAssignments={courseUnitAssignments}/>;
    });

    return (
      <div>
        <h3 className="course_title">
          {this.props.courseTitle}
        </h3>
        {courseUnitSections}
      </div>
    );
  }
});


module.exports = EnrollmentStatus;
window.dashboard = window.dashboard || {};
window.dashboard.EnrollmentStatus = EnrollmentStatus;
