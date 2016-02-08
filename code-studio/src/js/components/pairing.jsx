/**
 * A component for managing pair programming
 */
var Pairing = function (React) {

  var SectionSelector = React.createClass({
    handleChange: function(event) {
      this.props.handleChange(event);
    },

    render: function() {
      if (this.props.sections.length === 1) {
        return null;
      }

      return (
          <select name="sectionId" value={this.props.selectedSectionId} onChange={this.handleChange}>
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
        selectedStudentIds: []
      };
    },

    handleStudentClicked: function(event) {
      var selectedStudentIds = this.state.selectedStudentIds;
      var studentId = $(event.target).data('id');
      var index = selectedStudentIds.indexOf(studentId);
      if (index === -1) {
        // not selected, select it
        selectedStudentIds.push(studentId);
      } else {
        // selected, unselect it
        selectedStudentIds.splice(index, 1);
      }
      this.setState({selectedStudentIds: selectedStudentIds});
    },

    handleSubmit: function(event) {
      this.props.handleSubmit(this.state.selectedStudentIds);
      event.preventDefault();
    },

    render: function() {
      if (!this.props.students || this.props.students.length === 0) {
        return null;
      }

      var studentDivs = this.props.students.map(function (student) {
        var className = "student selectable";
        if (this.state.selectedStudentIds.indexOf(student.id) !== -1) {
          className = "student selectable selected";
        }
        return <div key={student.id} data-id={student.id} className={className} onClick={this.handleStudentClicked}>{student.name}</div>;
      }.bind(this));

      return (
          <div>
           {studentDivs}
           <div className="clear"/>
          <button onClick={this.handleSubmit} disabled={this.state.selectedStudentIds.length === 0}>Add Partners</button>
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
        pairings: this.props.pairings,
        selectedSectionId: '',
      };
    },

    componentDidMount: function() {
//      $.get(this.props.source, function(result) {
//        var x;
//      }.bind(this));
    },

    handleSectionChange: function(event) {
      this.setState({
        pairings: [],
        selectedSectionId: event.target.value,
      });
    },

    handleAddPartners: function (studentIds) {
      var pairings = [];
      this.selectedSection().students.map(function (student) {
        if (studentIds.indexOf(student.id) !== -1) {
          pairings.push(student);
        }
      });

      this.setState({
        pairings: pairings,
        selectedSectionId: this.selectedSectionId(),
      });
    },

    handleStop: function (event) {
      this.setState({
        pairings: [],
        selectedSectionId: '',
      });
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


    renderPairingSelector: function () {
      return (
        <div style={{width: DROPDOWN_WIDTH}}>
          <h1>Pair programming</h1>
          <h2>Choose partners:</h2>
          <br/>
          <form>
          <input type="hidden" name="authenticity_token" value={this.props.csrfToken}/>
          <SectionSelector sections={this.props.sections}
                           selectedSectionId={this.selectedSectionId()}
                           handleChange={this.handleSectionChange}
           />
          <div className="clear"/>
          <StudentSelector students={this.studentsInSection()} handleSubmit={this.handleAddPartners}/>
          </form>
          <a href="/">Cancel</a>
        </div>
      );
    },

    renderPairingState: function() {
      return (
        <div style={{width: DROPDOWN_WIDTH}}>
          <h1>Pair Programming</h1>
          <h2>You are Pair Programming with:</h2>
          {
            this.state.pairings.map(function (student) {
              return <div key={student.id} data-id={student.id} className='student'>{student.name}</div>;
            })
          }
          <div className="clear"/>
          <button className="stop" onClick={this.handleStop}>Stop Pair Programming</button>
          <a href="/">Cancel</a>
        </div>
      );
    },

    render: function () {
      if (this.state.pairings.length === 0) {
        return this.renderPairingSelector();
      } else {
        return this.renderPairingState();
      }
    },
  });
};

module.exports = Pairing;
