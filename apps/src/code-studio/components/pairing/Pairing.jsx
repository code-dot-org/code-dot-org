/* global $ */

import $ from 'jquery';
import React, {PropTypes} from 'react';
import SectionSelector from './SectionSelector.jsx';
import StudentSelector from './StudentSelector.jsx';
import i18n from "@cdo/locale";

/**
 * A component for managing pair programming.
 */
export default class Pairing extends React.Component {
  static propTypes = {
    source: PropTypes.string,
    handleClose: PropTypes.func
  };

  state = {
    pairings: [],
    sections: []
  };

  componentWillMount() {
    $.ajax({
      url: this.props.source,
      method: 'GET',
      dataType: 'json'
    }).done((result) => {
      this.setState({
        pairings: result.pairings,
        sections: result.sections
      });
    }).fail((result) => {
      // TODO what to do here?
    });
  }

  handleSectionChange = (event) => {
    this.setState({
      pairings: [],
      sections: this.state.sections,
      selectedSectionId: +event.target.value
    });
  };

  refreshUserMenu = () => {
    $.ajax({
      type: 'GET',
      url: '/dashboardapi/user_menu',
      success: data => $('#sign_in_or_user').html(data)
    });
  };

  handleAddPartners = (studentIds) => {
    const pairings = this.selectedSection().students.filter(
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
  };

  handleStop = (event) => {
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
  };

  selectedSectionId() {
    if (this.state.sections.length === 1) {
      return +this.state.sections[0].id;
    } else {
      return this.state.selectedSectionId;
    }
  }

  selectedSection() {
    const selectedId = this.selectedSectionId();
    if (selectedId) {
      return this.state.sections.find(s => s.id === selectedId) || null;
    }
    return null;
  }

  studentsInSection() {
    const section = this.selectedSection();
    return section ? section.students : null;
  }

  renderPairingSelector() {
    return (
      <div style={{maxHeight: window.innerHeight * 0.8 - 100, overflowY: 'auto'}}>
        <p className="dialog_title">{i18n.pairProgramming()}</p>
        <h1>{i18n.pairProgrammingChosePartners()}</h1>
        <br/>
        <form>
          <SectionSelector
            sections={this.state.sections}
            selectedSectionId={this.selectedSectionId()}
            handleChange={this.handleSectionChange}
          />
          <div className="clear"/>
          <StudentSelector
            students={this.studentsInSection()}
            handleSubmit={this.handleAddPartners}
          />
        </form>
      </div>
    );
  }

  renderPairingState() {
    return (
      <div>
        <h1>{i18n.pairProgramming()}</h1>
        <h2>{i18n.pairProgrammingWith()}</h2>
        {this.state.pairings.map(student =>
          <div
            key={student.id}
            data-id={student.id}
            className="student"
          >
            {student.name}
          </div>
        )}
        <div className="clear"/>
        <button className="stop" onClick={this.handleStop}>
          {i18n.pairProgrammingStop()}
        </button>
        <button className="ok" onClick={this.props.handleClose}>
          OK
        </button>
      </div>
    );
  }

  render() {
    if (this.state.pairings.length === 0) {
      return this.renderPairingSelector();
    } else {
      return this.renderPairingState();
    }
  }
}
