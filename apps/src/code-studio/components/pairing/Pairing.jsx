/* global $ */
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import SectionSelector from './SectionSelector.jsx';
import StudentSelector from './StudentSelector.jsx';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import color from '@cdo/apps/util/color';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

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
    sections: [],
    hasError: false,
    loading: true
  };

  UNSAFE_componentWillMount() {
    $.ajax({
      url: this.props.source,
      method: 'GET',
      dataType: 'json'
    })
      .done(result => {
        this.setState({
          pairings: result.pairings,
          sections: result.sections,
          loading: false
        });
      })
      .fail(result => {
        this.setState({
          loading: false,
          hasError: true
        });
      });
  }

  handleSectionChange = event => {
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

  handleAddPartners = studentIds => {
    this.setState({
      hasError: false,
      loading: true
    });
    const pairings = this.selectedSection().students.filter(
      student => studentIds.indexOf(student.id) !== -1
    );

    firehoseClient.putRecord(
      {
        study: 'pairing',
        study_group: 'pairing',
        event: 'initiating-pairing',
        data_json: JSON.stringify({
          location: window.location.href,
          number_partners: pairings.length,
          section_id: this.selectedSection().id
        })
      },
      {
        includeUserId: true,
        useProgressScriptId: true
      }
    );

    $.ajax({
      url: this.props.source,
      data: JSON.stringify({pairings, sectionId: this.selectedSection().id}),
      contentType: 'application/json; charset=utf-8',
      method: 'PUT',
      dataType: 'json',
      context: this
    })
      .done(() => {
        this.props.handleClose && this.props.handleClose();
        this.refreshUserMenu();
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        this.setState({
          hasError: true,
          loading: false
        });
      });
  };

  handleStop = event => {
    this.setState({
      hasError: false,
      loading: true
    });

    $.ajax({
      url: this.props.source,
      data: JSON.stringify({pairings: []}),
      contentType: 'application/json; charset=utf-8',
      method: 'PUT',
      dataType: 'json'
    })
      .done(() => {
        this.setState({
          pairings: []
        });
        this.refreshUserMenu();
        this.props.handleClose && this.props.handleClose();
      })
      .fail((_, textStatus, errorThrown) => {
        this.setState({
          hasError: true,
          loading: false
        });
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
      <div style={styles.pairingSelector}>
        <h1>{i18n.pairProgramming()}</h1>
        <h2>{i18n.pairProgrammingChosePartners()}</h2>
        <br />
        <form>
          <SectionSelector
            sections={this.state.sections}
            selectedSectionId={this.selectedSectionId()}
            handleChange={this.handleSectionChange}
          />
          <div className="clear" />
          <StudentSelector
            students={this.studentsInSection()}
            handleSubmit={this.handleAddPartners}
          />
          {this.state.loading && (
            <Spinner size="medium" style={styles.spinner} />
          )}
          {this.renderError()}
        </form>
      </div>
    );
  }

  renderPairingState() {
    return (
      <div>
        <h1>{i18n.pairProgramming()}</h1>
        <h2>{i18n.pairProgrammingWith()}</h2>
        {this.state.pairings.map(student => (
          <div key={student.id} data-id={student.id} className="student">
            {student.name}
          </div>
        ))}
        <div className="clear" />
        <button
          type="button"
          className="stop"
          onClick={this.handleStop}
          style={styles.leftButton}
        >
          {i18n.pairProgrammingStop()}
        </button>
        <button type="button" className="ok" onClick={this.props.handleClose}>
          {i18n.dialogOK()}
        </button>
        {this.state.loading && <Spinner size="medium" />}
        {this.renderError()}
      </div>
    );
  }

  renderError = () => {
    return this.state.hasError ? (
      <p style={styles.errorMessage}>{i18n.unexpectedError()}</p>
    ) : null;
  };

  render() {
    if (this.state.pairings.length === 0) {
      return this.renderPairingSelector();
    } else {
      return this.renderPairingState();
    }
  }
}

const styles = {
  pairingSelector: {
    maxHeight: window.innerHeight * 0.8 - 100,
    overflowY: 'auto'
  },
  spinner: {
    marginTop: '10px'
  },
  leftButton: {
    marginLeft: 0
  },
  errorMessage: {
    color: color.red
  }
};
