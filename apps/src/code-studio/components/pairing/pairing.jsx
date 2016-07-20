/* global $ */

import React from 'react';

import SectionSelector from './section_selector.jsx';
import StudentSelector from './student_selector.jsx';

/**
 * A component for managing pair programming.
 */
const Pairing = React.createClass({
  propTypes: {
    source: React.PropTypes.string,
    handleClose: React.PropTypes.func
  },

  getInitialState() {
    return {
      pairings: [],
      sections: []
    };
  },

  componentWillMount() {
    $.ajax({
      url: this.props.source,
      method: 'GET',
      dataType: 'json'
    }).done(function (result) {
      this.setState({
        pairings: result.pairings,
        sections: result.sections
      });
    }.bind(this)).fail(function (result) {
      // TODO what to do here?
    }.bind(this));
  },

  handleSectionChange(event) {
    this.setState({
      pairings: [],
      sections: this.state.sections,
      selectedSectionId: +event.target.value
    });
  },

  refreshUserMenu() {
    $.ajax({
      type: 'GET',
      url: '/dashboardapi/user_menu',
      success: function (data) {
        $('#sign_in_or_user').html(data);
      }
    });
  },

  handleAddPartners(studentIds) {
    var pairings = this.selectedSection().students.filter(
      student => studentIds.indexOf(student.id) !== -1
    );

    this.props.handleClose && this.props.handleClose();

    $.ajax({
      url: this.props.source,
      data: JSON.stringify({pairings}),
      contentType: 'application/json; charset=utf-8',
      method: 'PUT',
      dataType: 'json',
      context: this
    }).done(this.refreshUserMenu).fail((jqXHR, textStatus, errorThrown) => {
      // TODO what to do here?
    });
  },

  handleStop(event) {
    this.setState({
      pairings: []
    });

    $.ajax({
      url: this.props.source,
      data: JSON.stringify({pairings: []}),
      contentType: 'application/json; charset=utf-8',
      method: 'PUT',
      dataType: 'json'
    }).done(() => {
      this.refreshUserMenu();
      this.props.handleClose(); // close dialog
    }).fail((_, textStatus, errorThrown) => {
      // TODO what to do here?
    });

    event.preventDefault();
  },

  selectedSectionId() {
    if (this.state.sections.length === 1) {
      return +this.state.sections[0].id;
    } else {
      return this.state.selectedSectionId;
    }
  },

  selectedSection() {
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

  studentsInSection() {
    if (this.selectedSection()) {
      return this.selectedSection().students;
    }
    return null;
  },

  renderPairingSelector() {
    return (
      <div>
        <p className="dialog_title">Pair programming</p>
        <h1>Choose partners:</h1>
        <br/>
        <form>
          <SectionSelector
            sections={this.state.sections}
            selectedSectionId={this.selectedSectionId()}
            handleChange={this.handleSectionChange}
          />
          <div className="clear"></div>
          <StudentSelector students={this.studentsInSection()} handleSubmit={this.handleAddPartners}/>
        </form>
      </div>
    );
  },

  renderPairingState() {
    return (
      <div>
        <h1>Pair Programming</h1>
        <h2>You are Pair Programming with:</h2>
        {this.state.pairings.map(student =>
          <div key={student.id} data-id={student.id} className="student">{student.name}</div>
        )}
        <div className="clear"></div>
        <button className="stop" onClick={this.handleStop}>Stop Pair Programming</button>
        <button className="ok" onClick={this.props.handleClose}>OK</button>
      </div>
    );
  },

  render() {
    if (this.state.pairings.length === 0) {
      return this.renderPairingSelector();
    } else {
      return this.renderPairingState();
    }
  }
});
export default Pairing;
