/* global dashboard, React */

window.dashboard = window.dashboard || {};

/**
 * A component for managing pair programming
 */
window.dashboard.Pairing = (function (React) {
  var INPUT_WIDTH = 500;
  // dropdown width is wider so that it still lines up with inputs (which have
  // padding)
  var DROPDOWN_WIDTH = 514;

  var alert = window.alert;

  return React.createClass({
    propTypes: {
      sections: React.PropTypes.object,
      style: React.PropTypes.object
    },

    getInitialState: function() {
      return {
        sectionId: '',
        selectedStudentIds: {}
      };
    },

    componentDidMount: function() {
      $.get(this.props.source, function(result) {
        var lastGist = result[0];
        if (this.isMounted()) {
          this.setState({
            username: lastGist.owner.login,
            lastGistUrl: lastGist.html_url
          });
        }
    }.bind(this));
  },

    handleSectionChange: function(event) {
      console.log(event);
      this.setState({sectionId: event.target.value,
                     studentsInSection: [{id: 1, name: event.target.value + " Student 1"},
                                         {id: 2, name: event.target.value + " Student 2"},
                                         {id: 3, name: event.target.value + " Student 3"}],
                     selectedStudentIds: {}
                    });
    },

    handleStudentClicked: function(event) {
      var selectedStudentIds = this.state.selectedStudentIds;
      var studentId = $(event.target).data('id');
      if(selectedStudentIds[studentId]) {
        delete selectedStudentIds[studentId];
      } else {
        selectedStudentIds[studentId] = true;
      }
      this.setState({selectedStudentIds: selectedStudentIds});
    },

    handleSubmit: function (event) {
      console.log(this.state);
      event.preventDefault();
    },

    render: function () {
      var sectionSelector =
        <select name="sectionId" value={this.state.sectionId} onChange={this.handleSectionChange}>
        <option key="blank" value="">Choose your section</option>
        {
          this.props.sections.map(function (section) {
            return <option key={section.id} value={section.id}>{section.name}</option>;
          })
        }
        </select>;

      var studentSelector = "";

      if (this.state.sectionId) {
        studentSelector =
          this.state.studentsInSection.map(function (student) {
            var className = "student";
            if (this.state.selectedStudentIds[student.id]) {
              className = "student selected";
            }
            return <div key={student.id} data-id={student.id} className={className} onClick={this.handleStudentClicked}>{student.name}</div>;
          }.bind(this));
      }

      return (
        <div style={{width: DROPDOWN_WIDTH}}>
          <h2>Pair programming</h2>
          <br/>
          <form>
          <input type="hidden" name="authenticity_token" value={this.props.csrfToken}/>
          {sectionSelector}
          <div className="clear"/>
          {studentSelector}
          <div className="clear"/>
          <button onClick={this.handleSubmit}>
            Submit
          </button>
          </form>
        </div>
      );
    }
  });
})(React);
