/* global google */

/**
 * Form for creating / editing workshop details.
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import moment from 'moment';
import Spinner from '../components/spinner';
import SessionListFormPart from './session_list_form_part';
import FacilitatorListFormPart from './facilitator_list_form_part';
import {
  Grid,
  Row,
  Col,
  Modal,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Button,
  ButtonToolbar,
  Alert
} from 'react-bootstrap';
import {
  TIME_FORMAT,
  DATE_FORMAT,
  DATETIME_FORMAT
} from '../workshopConstants';

const styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  }
};

// Default to today, 9am-5pm.
const placeholderSession = {
  placeholderId: '_0',
  date: moment().format(DATE_FORMAT),
  startTime: '9:00am',
  endTime: '5:00pm'
};

const WorkshopForm = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    workshop: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      facilitators: React.PropTypes.array.isRequired,
      location_name: React.PropTypes.string.isRequired,
      location_address: React.PropTypes.string.isRequired,
      capacity: React.PropTypes.number.isRequired,
      workshop_type: React.PropTypes.string.isRequired,
      course: React.PropTypes.string.isRequired,
      subject: React.PropTypes.string,
      notes: React.PropTypes.string,
      sessions: React.PropTypes.array.isRequired,
      enrolled_teacher_count: React.PropTypes.number.isRequired
    }),
    onSaved: React.PropTypes.func,
    readOnly: React.PropTypes.bool,
    children: React.PropTypes.node,
  },

  getInitialState() {
    let initialState = {
      errors: [],
      shouldValidate: false,
      useAutocomplete: true,
      facilitators: [],
      location_name: '',
      location_address: '',
      capacity: '',
      workshop_type: '',
      course: '',
      subject: '',
      notes:'',
      sessions: [placeholderSession],
      destroyedSessions: [],
      availableFacilitators: [],
      showSaveConfirmation: false
    };

    if (this.props.workshop) {
      initialState = _.merge(initialState,
        _.pick(this.props.workshop, [
          'facilitators',
          'location_name',
          'location_address',
          'capacity',
          'workshop_type',
          'course',
          'subject',
          'notes'
        ])
      );
      initialState.sessions = this.prepareSessionsForForm(this.props.workshop.sessions);
      this.loadAvailableFacilitators(this.props.workshop.course);
    }
    return initialState;
  },

  componentDidMount() {
    this.enableAutocompleteLocation();
  },

  componentWillUnmount() {
    if (this.isGoogleMapsLoaded()) {
      if (this.gm_authFailure) {
        window.gm_authFailure = this.old_gm_authFailure;
      }
      if (this.autocomplete) {
        google.maps.event.clearInstanceListeners(this.autocomplete);
      }
    }
    if (this.saveRequest) {
      this.saveRequest.abort();
    }
    if (this.loadWorkshopRequest) {
      this.loadWorkshopRequest.abort();
    }
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.readOnly && !this.props.readOnly) {
      this.setState(this.getInitialState());
    }
  },

  componentDidUpdate() {
    this.enableAutocompleteLocation();
  },

  loadAvailableFacilitators(course) {
    this.loadWorkshopRequest = $.ajax({
      method: "GET",
      url: `/api/v1/pd/course_facilitators?course=${course}`,
      dataType: "json"
    }).done(data => {
      this.setState({availableFacilitators: data});
    });
  },

  isGoogleMapsLoaded() {
    return (typeof google === 'object' && typeof google.maps === 'object');
  },

  enableAutocompleteLocation() {
    if (!this.state.useAutocomplete) {
      return;
    }

    // The way to catch google auth errors is in a global function :(
    // See https://developers.google.com/maps/documentation/javascript/events#auth-errors
    // If google auth fails, remove the autocomplete and re-draw.
    if (!this.gm_authFailure) {
      // Save existing function, if one exists.
      this.old_gm_authFailure = window.gm_authFailure;
      window.gm_authFailure = this.gm_authFailure = () => {
        if (this.old_gm_authFailure) {
          this.old_gm_authFailure();
        }
        this.setState({useAutocomplete: false});
      };
    }

    if (!this.autocomplete && this.locationAddressControl && this.isGoogleMapsLoaded()) {
      this.autocomplete = new google.maps.places.Autocomplete(this.locationAddressControl);
      google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
        const place = this.autocomplete.getPlace();
        this.setState({location_address: place.formatted_address});
      });
    }
  },

  // Convert from [start, end] to [date, startTime, endTime]
  prepareSessionsForForm(sessions) {
    return sessions.map(session => {
      return {
        id: session.id,
        date: moment.utc(session.start).format(DATE_FORMAT),
        startTime: moment.utc(session.start).format(TIME_FORMAT),
        endTime: moment.utc(session.end).format(TIME_FORMAT)
      };
    });
  },

  // Convert from [date, startTime, endTime] to [start, end] and merge destroyedSessions
  prepareSessionsForApi(sessions, destroyedSessions) {
    return sessions.map(session => {
      return {
        id: session.id,
        start: moment.utc(session.date + ' ' + session.startTime, DATETIME_FORMAT).format(),
        end: moment.utc(session.date + ' ' + session.endTime, DATETIME_FORMAT).format()
      };
    }).concat(destroyedSessions.map(destroyedSession => {
      return {
        id: destroyedSession.id,
        _destroy: true
      };
    }));
  },

  // Convert from [id, name, email] to an array of ids.
  prepareFacilitatorsForApi(facilitators) {
    return facilitators.filter(f => f.id > 0).map(f => f.id);
  },

  handleSessionsChange(sessions, removedSession) {
    sessions = _.cloneDeep(sessions);
    const destroyedSessions = [];
    if (removedSession && removedSession.id) {
      destroyedSessions.push(removedSession);
    }
    this.setState({
      sessionsModified: true,
      sessions,
      destroyedSessions
    });
  },
  handleFacilitatorsChange(facilitators) {
    this.setState({facilitators: facilitators});
  },

  renderCourseSelect(validation) {
    const options = window.dashboard.workshop.COURSES.map((course, i) => {
      return (<option key={i} value={course}>{course}</option>);
    });
    const placeHolder = this.state.course ? null : <option />;
    return (
      <FormGroup validationState={validation.style.course}>
        <ControlLabel>Course</ControlLabel>
        <FormControl
          componentClass="select"
          value={this.state.course || ''}
          name="course"
          onChange={this.handleCourseChange}
          style={this.getInputStyle()}
          disabled={this.props.readOnly}
        >
          {placeHolder}
          {options}
        </FormControl>
        <HelpBlock>{validation.help.course}</HelpBlock>
      </FormGroup>
    );
  },

  renderWorkshopTypeSelect(validation) {
    const options = window.dashboard.workshop.TYPES.map((workshopType, i) => {
      return (<option key={i} value={workshopType}>{workshopType}</option>);
    });
    const placeHolder = this.state.workshop_type ? null : <option />;
    return (
      <FormGroup validationState={validation.style.workshop_type}>
        <ControlLabel>Workshop Type</ControlLabel>
        <FormControl
          componentClass="select"
          value={this.state.workshop_type || ''}
          name="workshop_type"
          onChange={this.handleFieldChange}
          style={this.getInputStyle()}
          disabled={this.props.readOnly}
        >
          {placeHolder}
          {options}
        </FormControl>
        <HelpBlock>{validation.help.workshop_type}</HelpBlock>
      </FormGroup>
    );
  },

  shouldRenderSubject() {
    return this.state.course && window.dashboard.workshop.SUBJECTS[this.state.course];
  },

  renderSubjectSelect(validation) {
    if (this.shouldRenderSubject()) {
      const options = window.dashboard.workshop.SUBJECTS[this.state.course].map((subject, i) => {
        return (<option key={i} value={subject}>{subject}</option>);
      });
      const placeHolder = this.state.subject ? null : <option />;
      return (
        <FormGroup validationState={validation.style.subject}>
          <ControlLabel>Subject</ControlLabel>
          <FormControl
            componentClass="select"
            value={this.state.subject || ''}
            name="subject"
            onChange={this.handleFieldChange}
            style={this.props.readOnly && styles.readOnlyInput}
            disabled={this.props.readOnly}
          >
            {placeHolder}
            {options}
          </FormControl>
          <HelpBlock>{validation.help.subject}</HelpBlock>
        </FormGroup>
      );
    }
  },

  getInputStyle() {
    return this.props.readOnly && styles.readOnlyInput;
  },

  handleErrorClick(i) {
    const errors = _.cloneDeep(this.state.errors);
    errors.splice(i,1);
    this.setState({errors: errors});
  },

  renderErrors() {
    if (!this.state.errors || this.state.errors.length === 0) {
      return null;
    }
    return this.state.errors.map((error, i) => {
      return (
        <Alert
          bsStyle="danger"
          key={i}
          onDismiss={this.handleErrorClick.bind(null, i)}
        >
          {error}
        </Alert>
      );
    });
  },

  shouldConfirmSave() {
    const workshop = this.props.workshop;
    if (!workshop || workshop.enrolled_teacher_count === 0) {
      return false;
    }
    return (
      this.state.sessionsModified ||
      this.state.location_name !== workshop.location_name ||
      this.state.location_address !== workshop.location_address ||
      this.state.notes !== workshop.notes
    );
  },

  handleSaveClick() {
    const validation = this.validate();
    if (validation.isValid) {
      if (this.shouldConfirmSave()) {
        this.setState({showSaveConfirmation: true});
      } else {
        this.save(false);
      }
    } else {
      this.setState({shouldValidate: true});
    }
  },

  handleSaveAndNotifyClick() {
    this.save(true);
  },

  handleSaveNoNotifyClick() {
    this.save(false);
  },

  handleAbortSave() {
    this.setState({showSaveConfirmation: false});
  },

  // Determines which field to update based on the target's name attribute. Returns new value.
  handleFieldChange(event) {
    const fieldName = $(event.target).attr('name');
    if (!fieldName) {
      console.error("Expected name attribute on handleFieldChange target.");
      return null;
    }

    const value = event.target.value;
    this.setState({[fieldName]: value});
    return value;
  },

  handleCourseChange(event) {
    const course = this.handleFieldChange(event);

    // clear facilitators and subject
    this.setState({facilitators: [], subject: null});
    this.loadAvailableFacilitators(course);
  },

  save(notify = false) {
    const workshop_data = {
      facilitators: this.prepareFacilitatorsForApi(this.state.facilitators),
      location_name: this.state.location_name,
      location_address: this.state.location_address,
      capacity: this.state.capacity,
      workshop_type: this.state.workshop_type,
      course: this.state.course,
      subject: this.state.subject,
      notes: this.state.notes,
      sessions_attributes: this.prepareSessionsForApi(this.state.sessions, this.state.destroyedSessions)
    };

    let method, url;
    if (this.props.workshop) {
      method = 'PATCH';
      url = '/api/v1/pd/workshops/' + this.props.workshop.id;
    } else {
      method = 'POST';
      url = '/api/v1/pd/workshops';
    }

    this.saveRequest = $.ajax({
      method: method,
      url: url,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({pd_workshop: workshop_data, notify})
    }).done(data => {
      if (this.props.onSaved) {
        this.props.onSaved(data);
      }
    }).fail(data => {
      if (data.responseJSON.errors) {
        this.setState({
          errors: data.responseJSON.errors,
          showSaveConfirmation: false
        });
      }
    });
  },

  handleCancelClick() {
    // discard changes.
    this.context.router.goBack();
  },

  shouldShowFacilitators() {
    return !['Counselor', 'Admin'].includes(this.state.course);
  },

  renderFormButtons() {
    if (this.props.readOnly) {
      return null;
    }

    const saveText = this.props.workshop ? 'Save' : 'Publish';
    return (
      <Row>
        <Col sm={12}>
          {this.renderErrors()}
          <ButtonToolbar>
            <Button bsStyle="primary" id="workshop-form-save-btn" onClick={this.handleSaveClick}>
              {saveText}
            </Button>
            <Button onClick={this.handleCancelClick}>
              Cancel
            </Button>
          </ButtonToolbar>
          <Modal show={this.state.showSaveConfirmation} onHide={this.handleAbortSave}>
            <Modal.Header closeButton>
              <Modal.Title>Workshop Updated.</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              You updated important information regarding your workshop. Do you want to email an update?
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="primary" onClick={this.handleSaveAndNotifyClick}>Email</Button>
              <Button onClick={this.handleSaveNoNotifyClick}>Don't Email</Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    );
  },

  render() {
    if (this.state.loading) {
      return <Spinner/>;
    }
    return this.renderForm();
  },

  validate(shouldValidate = true) {
    const validation = {isValid: true, style: {}, help: {}};
    if (shouldValidate) {
      for (let i = 0; i < this.state.sessions.length; i++) {
        const session = this.state.sessions[i];
        if (!session.date || !moment(session.date, DATE_FORMAT).isValid() ||
          !session.startTime || !moment(session.startTime, TIME_FORMAT).isValid() ||
          !session.endTime || !moment(session.endTime, TIME_FORMAT).isValid()) {
          validation.isValid = false;
        }
      }
      if (!this.state.location_name) {
        validation.isValid = false;
        validation.style.location_name = "error";
        validation.help.location_name = "Required.";
      }
      if (!this.state.location_address) {
        validation.isValid = false;
        validation.style.location_address = "error";
        validation.help.location_address = "Required.";
      }
      if (!this.state.capacity) {
        validation.isValid = false;
        validation.style.capacity = "error";
        validation.help.capacity = "Required.";
      } else if (!/^[1-9]\d*$/.test(this.state.capacity)) {
        validation.isValid = false;
        validation.style.capacity = "error";
        validation.help.capacity = "Must be a positive integer.";
      }
      if (!this.state.workshop_type) {
        validation.isValid = false;
        validation.style.workshop_type = "error";
        validation.help.workshop_type = "Required.";
      }
      if (!this.state.course) {
        validation.isValid = false;
        validation.style.course = "error";
        validation.help.course = "Required.";
      }
      if (this.shouldRenderSubject() && !this.state.subject) {
        validation.isValid = false;
        validation.style.subject = "error";
        validation.help.subject = "Required.";
      }
    }
    return validation;
  },

  renderForm() {
    const validation = this.validate(this.state.shouldValidate);

    return (
      <Grid>
        <form>
          <Row>
            <Col sm={4}>
              All workshop times are local:
            </Col>
          </Row>
          <SessionListFormPart
            sessions={this.state.sessions}
            onChange={this.handleSessionsChange}
            shouldValidate={this.state.shouldValidate}
            readOnly={this.props.readOnly}
          />
          <br/>
          <Row>
            <Col sm={4}>
              <FormGroup validationState={validation.style.location_name}>
                <ControlLabel>Location Name</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.location_name || ''}
                  name="location_name"
                  onChange={this.handleFieldChange}
                  maxLength={255}
                  style={this.getInputStyle()}
                  disabled={this.props.readOnly}
                />
                <HelpBlock>{validation.help.location_name}</HelpBlock>
              </FormGroup>
            </Col>
            <Col sm={6}>
              <FormGroup validationState={validation.style.location_address}>
                <ControlLabel>Location Address</ControlLabel>
                <FormControl
                  type="text"
                  key={this.state.useAutocomplete} // Change key to force re-draw
                  ref={ref => this.locationAddressControl = ReactDOM.findDOMNode(ref)}
                  value={this.state.location_address || ''}
                  placeholder="Enter a location"
                  name="location_address"
                  onChange={this.handleFieldChange}
                  maxLength={255}
                  style={this.getInputStyle()}
                  disabled={this.props.readOnly}
                />
                <HelpBlock>{validation.help.location_address}</HelpBlock>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm={2}>
              <FormGroup validationState={validation.style.capacity}>
                <ControlLabel>Capacity</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.capacity || ''}
                  name="capacity"
                  onChange={this.handleFieldChange}
                  maxLength={4}
                  style={this.getInputStyle()}
                  disabled={this.props.readOnly}
                />
                <HelpBlock>{validation.help.capacity}</HelpBlock>
              </FormGroup>
            </Col>
            <Col sm={2}>
              {this.renderWorkshopTypeSelect(validation)}
            </Col>
            <Col sm={3}>
              {this.renderCourseSelect(validation)}
            </Col>
            <Col sm={3}>
              {this.renderSubjectSelect(validation)}
            </Col>
          </Row>
          <Row>
            <Col sm={10}>
              <FormGroup>
                <ControlLabel>Notes (optional)</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  placeholder="Use this space to tell teachers any important
                  information like building location, lunch options or pre-work."
                  value={this.state.notes || ''}
                  name="notes"
                  onChange={this.handleFieldChange}
                  maxLength={65535}
                  rows={Math.max(5, this.state.notes.split("\n").length + 1)}
                  style={this.getInputStyle()}
                  disabled={this.props.readOnly}
                />
              </FormGroup>
            </Col>
          </Row>
          {
            this.shouldShowFacilitators() && (
              <FacilitatorListFormPart
                availableFacilitators={this.state.availableFacilitators}
                facilitators={this.state.facilitators}
                course={this.state.course}
                onChange={this.handleFacilitatorsChange}
                readOnly={this.props.readOnly}
              />
            )
          }
          {this.renderFormButtons()}
          {this.props.children}
        </form>
      </Grid>
    );
  }
});
module.exports = WorkshopForm;
