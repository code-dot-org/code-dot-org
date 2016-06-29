/**
 * A component for managing pair programming
 */

/* global React, dashboard, $ */

var SectionSelector = React.createClass({
  handleChange: function (event) {
    this.props.handleChange(event);
  },

  render: function () {
    if (this.props.sections.length === 0 ||
        this.props.sections.length === 1) {
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
  getInitialState: function () {
    return {
      selectedStudentIds: []
    };
  },

  handleStudentClicked: function (event) {
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

  handleSubmit: function (event) {
    this.props.handleSubmit(this.state.selectedStudentIds);
    event.preventDefault();
  },

  render: function () {
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
        {
          (this.state.selectedStudentIds.length === 0) ?
            "" :
            <button onClick={this.handleSubmit} disabled={this.state.selectedStudentIds.length === 0} className="addPartners" >Add Partners</button>
        }
      </div>
    );
  },
});

// TODO pass this in
var DROPDOWN_WIDTH = 514;

var Pairing = React.createClass({
  propTypes: {
    source: React.PropTypes.string,
  },

  getInitialState: function () {
    return {
      pairings: [],
      sections: [],
      selectedSectionId: '',
    };
  },

  componentDidMount: function () {
    $.ajax({url: this.props.source,
            method: 'GET',
            dataType: 'json'})
      .done(function (result) {
        this.setState({
          pairings: result.pairings,
          sections: result.sections,
          selectedSectionId: ''
        });
      }.bind(this))
      .fail(function (result) {
        // TODO what to do here?
      }.bind(this));
  },

  handleSectionChange: function (event) {
    this.setState({
      pairings: [],
      sections: this.state.sections,
      selectedSectionId: +event.target.value
    });
  },

  refreshUserMenu: function () {
    $.ajax({
      type: "GET",
      url: '/dashboardapi/user_menu',
      success: function (data) {
        $('#sign_in_or_user').html(data);
      }
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

    $.ajax({url: this.props.source,
            data: JSON.stringify({pairings: pairings}),
            contentType: 'application/json; charset=utf-8',
            method: 'PUT',
            dataType: 'json',
            context: this})
      .done(function (data, textStatus, jqXHR) {
        this.refreshUserMenu();
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        // TODO what to do here?
      });
  },

  handleStop: function (event) {
    this.setState({
      pairings: [],
      selectedSectionId: '',
    });

    $.ajax({url: this.props.source,
            data: JSON.stringify({pairings: []}),
            contentType: 'application/json; charset=utf-8',
            method: 'PUT',
            dataType: 'json'})
      .done(function (data, textStatus, jqXHR) {
        this.refreshUserMenu();
        this.props.handleClose(); // close dialog
      }.bind(this))
      .fail(function (jqXHR, textStatus, errorThrown) {
        // TODO what to do here?
      }.bind(this));

    event.preventDefault();
  },

  selectedSectionId: function () {
    if (this.state.sections.length === 1) {
      return this.state.sections[0].id;
    } else {
      return this.state.selectedSectionId;
    }
  },

  selectedSection: function () {
    if (this.selectedSectionId()) {
      // todo use jquery find
      for (var i = 0; i < this.state.sections.length; i++) {
        if (this.state.sections[i].id === this.selectedSectionId()) {
          return this.state.sections[i];
        }
      }
    }
    return null;
  },

  studentsInSection: function () {
    if (this.selectedSection()) {
      return this.selectedSection().students;
    }
    return null;
  },


  renderPairingSelector: function () {
    return (
        <div style={{width: DROPDOWN_WIDTH}}>
        <p className="dialog_title">Pair programming</p>
        <h1>Choose partners:</h1>
        <br/>
        <form>
        <input type="hidden" name="authenticity_token" value={this.props.csrfToken}/>
        <SectionSelector sections={this.state.sections}
      selectedSectionId={this.selectedSectionId()}
      handleChange={this.handleSectionChange}
        />
        <div className="clear"/>
        <StudentSelector students={this.studentsInSection()} handleSubmit={this.handleAddPartners}/>
        </form>
        </div>
    );
  },

  renderPairingState: function () {
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
        <button className="ok" onClick={this.props.handleClose}>OK</button>
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

module.exports = Pairing;

window.dashboard = window.dashboard || {};
window.dashboard.Pairing = Pairing;
