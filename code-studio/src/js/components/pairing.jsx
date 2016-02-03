/**
 * A component for managing pair programming
 */
var Pairing = function (React) {

  var SectionSelector = React.createClass({
    render: function() {
      if (this.props.sections.length === 1) {
        return null;
      }

      return (
          <select name="sectionId" value={this.props.selectedSectionId} onChange={this.handleSectionChange}>
          <option key="blank" value="">Choose your section</option>
          {
            this.props.sections.map(function (section) {
              return <option key={section.id} value={section.id}>{section.name}</option>;
            })
          }
        </select>
      );
    },
  });

  var StudentSelector = React.createClass({
    getInitialState: function() {
      return {
        selectedStudentIds: {}
      };
    },

    handleStudentClicked: function(event) {
      var selectedStudentIds = this.state.selectedStudentIds;
      var studentId = $(event.target).data('id');
      if (selectedStudentIds[studentId]) {
        delete selectedStudentIds[studentId];
      } else {
        selectedStudentIds[studentId] = true;
      }
      this.setState({selectedStudentIds: selectedStudentIds});
    },

    render: function() {
      if (!this.props.students || this.props.students.length === 0) {
        return null;
      }

      var studentDivs = this.props.students.map(function (student) {
        var className = "student";
        if (this.state.selectedStudentIds[student.id]) {
          className = "student selected";
        }
        return <div key={student.id} data-id={student.id} className={className} onClick={this.handleStudentClicked}>{student.name}</div>;
      }.bind(this));

      return (
          <div>
           {studentDivs}
            <div className="clear"/>
            <button onClick={this.handleSubmit}>Submit</button>
          </div>
      );
    },
  });

  var INPUT_WIDTH = 500;
  // dropdown width is wider so that it still lines up with inputs (which have
  // padding)
  var DROPDOWN_WIDTH = 514;

  var alert = window.alert;

  return React.createClass({
    propTypes: {
      pairings: React.PropTypes.array,
      sections: React.PropTypes.array,
      style: React.PropTypes.object
    },

    getInitialState: function() {
      return {
        pairings: {},
        sectionId: '',
        selectedStudentIds: {}
      };
    },

    componentDidMount: function() {
//      $.get(this.props.source, function(result) {
//        var x;
//      }.bind(this));
    },

    handleSectionChange: function(event) {
      this.setState({sectionId: event.target.value,
                     selectedStudentIds: {}
                    });
    },

    handleSubmit: function (event) {
      event.preventDefault();
    },

    selectedSectionId: function() {
      if (this.props.sections.length === 1) {
        return this.props.sections[0].id;
      } else {
        return this.state.selectedSectionId;
      }
    },

    selectedSection: function() {
      if (this.selectedSectionId()) {
        // todo use jquery find
        for (var i = 0; i < this.props.sections.length; i++) {
          if (this.props.sections[i].id == this.selectedSectionId()) {
            return this.props.sections[i];
          }
        }
      }
      return null;
    },

    studentsInSection: function() {
      if (this.selectedSection()) {
        return this.selectedSection().students;
      }
      return null;
    },

    render: function () {
      return (
        <div style={{width: DROPDOWN_WIDTH}}>
          <h2>Pair programming</h2>
          <br/>
          <form>
          <input type="hidden" name="authenticity_token" value={this.props.csrfToken}/>
          <SectionSelector sections={this.props.sections} selectedSectionId={this.selectedSectionId()}/>
          <div className="clear"/>
          <StudentSelector students={this.studentsInSection()}/>
          </form>
        </div>
      );
    }
  });
};

module.exports = Pairing;
