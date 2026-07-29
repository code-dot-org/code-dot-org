import Modal from '@code-dot-org/component-library/modal';
import {Typography as MuiTypography} from '@mui/material';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner.jsx';
import i18n from '@cdo/locale';

import SectionSelector from './SectionSelector.jsx';
import StudentSelector from './StudentSelector.jsx';

import moduleStyles from './pairing.module.scss';

const MAX_PARTNERS = 4;

/**
 * A component for managing pair programming.
 */
export default class Pairing extends React.Component {
  static propTypes = {
    source: PropTypes.string,
    handleClose: PropTypes.func,
  };

  state = {
    pairings: [],
    sections: [],
    selectedSectionId: null,
    selectedStudentIds: [],
    hasError: false,
    loading: true,
  };

  UNSAFE_componentWillMount() {
    $.ajax({
      url: this.props.source,
      method: 'GET',
      dataType: 'json',
    })
      .done(result => {
        this.setState({
          pairings: result.pairings,
          sections: result.sections,
          selectedSectionId: result.selectedSectionId,
          loading: false,
        });
      })
      .fail(result => {
        this.setState({
          loading: false,
          hasError: true,
        });
      });
  }

  handleSectionChange = event => {
    this.setState({
      pairings: [],
      sections: this.state.sections,
      selectedSectionId: +event.target.value,
      selectedStudentIds: [],
    });
  };

  handleStudentSelectionChange = selectedStudentIds => {
    this.setState({selectedStudentIds});
  };

  refreshUserMenu = () => {
    const showCreateMenu = $('.create_menu').length > 0;
    $.ajax({
      type: 'GET',
      url: `/dashboardapi/user_menu?showCreateMenu=${showCreateMenu}`,
      success: data => $('#sign_in_or_user').html(data),
    });
  };

  handleAddPartners = () => {
    const {selectedStudentIds} = this.state;
    if (selectedStudentIds.length === 0) return;

    this.setState({
      hasError: false,
      loading: true,
    });
    const pairings = this.selectedSection().students.filter(
      student => selectedStudentIds.indexOf(student.id) !== -1
    );

    analyticsReporter.sendEvent(EVENTS.PAIRING_ADD_PARTNER_BUTTON_CLICKED, {
      location: window.location.href,
      number_partners: pairings.length,
      section_id: this.selectedSection().id,
    });

    $.ajax({
      url: this.props.source,
      data: JSON.stringify({pairings, sectionId: this.selectedSection().id}),
      contentType: 'application/json; charset=utf-8',
      method: 'PUT',
      dataType: 'json',
      context: this,
    })
      .done(() => {
        this.props.handleClose && this.props.handleClose();
        this.refreshUserMenu();
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        this.setState({
          hasError: true,
          loading: false,
        });
      });
  };

  handleStop = () => {
    this.setState({
      hasError: false,
      loading: true,
    });
    analyticsReporter.sendEvent(
      EVENTS.PAIRING_STOP_PAIR_PROGRAMMING_BUTTON_CLICKED,
      {
        section_id: this.selectedSection()?.id,
      }
    );

    $.ajax({
      url: this.props.source,
      data: JSON.stringify({pairings: []}),
      contentType: 'application/json; charset=utf-8',
      method: 'PUT',
      dataType: 'json',
    })
      .done(() => {
        this.setState({
          pairings: [],
        });
        this.refreshUserMenu();
        this.props.handleClose && this.props.handleClose();
      })
      .fail((_, textStatus, errorThrown) => {
        this.setState({
          hasError: true,
          loading: false,
        });
      });
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
    const {selectedStudentIds} = this.state;
    const exceededMaximum = selectedStudentIds.length >= MAX_PARTNERS;
    const canSubmit = selectedStudentIds.length > 0 && !this.state.loading;

    return (
      <Modal
        id="pairing"
        title={i18n.pairProgramming()}
        description={i18n.pairProgrammingChosePartners()}
        onClose={this.props.handleClose}
        customContent={
          <div className={moduleStyles.modalContent}>
            <SectionSelector
              sections={this.state.sections}
              selectedSectionId={this.selectedSectionId()}
              handleChange={this.handleSectionChange}
            />
            <StudentSelector
              students={this.studentsInSection()}
              selectedStudentIds={selectedStudentIds}
              onSelectionChange={this.handleStudentSelectionChange}
              maxSelections={MAX_PARTNERS}
            />
            {exceededMaximum && (
              <MuiTypography variant="body2" className={moduleStyles.warning}>
                {i18n.exceededPairProgrammingMax()}
              </MuiTypography>
            )}
            {this.state.loading && <Spinner size="medium" />}
            {this.renderError()}
          </div>
        }
        primaryButtonProps={{
          id: 'pairing-add-partners',
          children: i18n.addPartners(),
          onClick: this.handleAddPartners,
          disabled: !canSubmit,
        }}
      />
    );
  }

  renderPairingState() {
    return (
      <Modal
        id="pairing"
        title={i18n.pairProgramming()}
        description={i18n.pairProgrammingWith()}
        onClose={this.props.handleClose}
        customContent={
          <div className={moduleStyles.modalContent}>
            <div className={moduleStyles.pairingList}>
              {this.state.pairings.map(student => (
                <div
                  key={student.id}
                  data-id={student.id}
                  className={moduleStyles.student}
                >
                  {student.name}
                </div>
              ))}
            </div>
            {this.state.loading && <Spinner size="medium" />}
            {this.renderError()}
          </div>
        }
        primaryButtonProps={{
          children: i18n.dialogOK(),
          onClick: this.props.handleClose,
        }}
        secondaryButtonProps={{
          children: i18n.pairProgrammingStop(),
          onClick: this.handleStop,
          color: 'error',
          disabled: this.state.loading,
        }}
      />
    );
  }

  renderError = () => {
    return this.state.hasError ? (
      <MuiTypography variant="body2" className={moduleStyles.warning}>
        {i18n.unexpectedError()}
      </MuiTypography>
    ) : null;
  };

  render() {
    if (this.state.pairings.length === 0) {
      return this.renderPairingSelector();
    }
    return this.renderPairingState();
  }
}
