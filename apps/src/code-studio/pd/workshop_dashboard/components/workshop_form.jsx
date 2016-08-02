/* global google */

/*
 Form for creating / editing workshop details.
 */

import $ from 'jquery';
var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');
var moment = require('moment');
var SessionListFormPart = require('./session_list_form_part');
var FacilitatorListFormPart = require('./facilitator_list_form_part');
var Modal = require('react-bootstrap').Modal;
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Alert = require('react-bootstrap').Alert;

var styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  }
};

var WorkshopForm = React.createClass({
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
      sessions: React.PropTypes.array.isRequired
    }),
    onSaved: React.PropTypes.func,
    readOnly: React.PropTypes.bool,
    children: React.PropTypes.node,
  },

  getInitialState: function () {
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
      sessions: [{placeholderId: '_0'}],
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

  componentDidMount: function () {
    this.enableAutocompleteLocation();
  },

  componentWillUnmount: function () {
    if (this.isGoogleMapsLoaded()) {
      if (this.gm_authFailure) {
        window.gm_authFailure = this.old_gm_authFailure;
      }
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
    if (this.saveRequest) {
      this.saveRequest.abort();
    }
    if (this.loadWorkshopRequest) {
      this.loadWorkshopRequest.abort();
    }
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.readOnly && !this.props.readOnly) {
      this.setState(this.getInitialState());
    }
  },

  componentDidUpdate: function () {
    this.enableAutocompleteLocation();
  },

  loadAvailableFacilitators: function (course) {
    this.loadWorkshopRequest = $.ajax({
      method: "GET",
      url: `/api/v1/pd/course_facilitators?course=${course}`,
      dataType: "json"
    }).done(function (data) {
      this.setState({availableFacilitators: data});
    }.bind(this));
  },

  isGoogleMapsLoaded: function () {
    return (typeof google === 'object' && typeof google.maps === 'object');
  },

  enableAutocompleteLocation: function () {
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

    if (!this.autocomplete && this.isGoogleMapsLoaded()) {
      this.autocomplete = new google.maps.places.Autocomplete($(ReactDOM.findDOMNode(this)).find('.location-autocomplete')[0]);
      google.maps.event.addListener(this.autocomplete, 'place_changed', function () {
        var place = this.autocomplete.getPlace();
        this.setState({location_address: place.formatted_address});
      }.bind(this));
    }
  },

  // Convert from [start, end] to [date, startTime, endTime]
  prepareSessionsForForm: function (sessions) {
    return sessions.map(function (session) {
      return {
        id: session.id,
        date: moment.utc(session.start).format('MM/DD/YY'),
        startTime: moment.utc(session.start).format('HH:mm'),
        endTime: moment.utc(session.end).format('HH:mm')
      };
    });
  },

  // Convert from [date, startTime, endTime] to [start, end] and merge destroyedSessions
  prepareSessionsForApi: function (sessions, destroyedSessions) {
    return sessions.map(function (session) {
      return {
        id: session.id,
        start: moment.utc(session.date + ' ' + session.startTime, 'MM/DD/YY HH:mm').format(),
        end: moment.utc(session.date + ' ' + session.endTime, 'MM/DD/YY HH:mm').format()
      };
    }).concat(destroyedSessions.map(function (destroyedSession) {
      return {
        id: destroyedSession.id,
        _destroy: true
      };
    }));
  },

  // Convert from [id, name, email] to an array of ids.
  prepareFacilitatorsForApi: function (facilitators) {
    return facilitators.filter((f) => f.id > 0).map((f) => f.id);
  },

  handleSessionsChange: function (sessions, removedSession) {
    sessions = _.cloneDeep(sessions);
    sessions.sessionsModified = true;
    var destroyedSessions = [];
    if (removedSession && removedSession.id) {
      destroyedSessions.push(removedSession);
    }
    this.setState({sessions, destroyedSessions});
  },
  handleFacilitatorsChange: function (facilitators) {
    this.setState({facilitators: facilitators});
  },

  renderCourseSelect: function (validation) {
    var options = window.dashboard.workshop.COURSES.map(function (course, i) {
      return (<option key={i} value={course}>{course}</option>);
    });
    var placeHolder = this.state.course ? null : <option />;
    return (
      <Input
        type="select"
        label="Course"
        value={this.state.course || ''}
        onChange={this.handleCourseChange}
        bsStyle={validation.style.course}
        help={validation.help.course}
        style={this.props.readOnly && styles.readOnlyInput}
        disabled={this.props.readOnly}
      >
        {placeHolder}
        {options}
      </Input>
    );
  },

  renderWorkshopTypeSelect: function (validation) {
    var options = window.dashboard.workshop.TYPES.map(function (workshopType, i) {
      return (<option key={i} value={workshopType}>{workshopType}</option>);
    });
    var placeHolder = this.state.workshop_type ? null : <option />;
    return (
      <Input
        type="select"
        label="Workshop Type"
        value={this.state.workshop_type || ''}
        onChange={(event) => {this.handleFieldChange('workshop_type', event.target.value);}}
        bsStyle={validation.style.workshop_type}
        help={validation.help.workshop_type}
        style={this.props.readOnly && styles.readOnlyInput}
        disabled={this.props.readOnly}
      >
        {placeHolder}
        {options}
      </Input>
    );
  },

  shouldRenderSubject() {
    return this.state.course && window.dashboard.workshop.SUBJECTS[this.state.course];
  },

  renderSubjectSelect: function (validation) {
    if (this.shouldRenderSubject()) {
      var options = window.dashboard.workshop.SUBJECTS[this.state.course].map(function (subject, i) {
        return (<option key={i} value={subject}>{subject}</option>);
      });
      var placeHolder = this.state.subject ? null : <option />;
      return (
        <Input
          type="select"
          label="Subject"
          value={this.state.subject || ''}
          onChange={(event) => {this.handleFieldChange('subject', event.target.value);}}
          bsStyle={validation.style.subject}
          help={validation.help.subject}
          style={this.props.readOnly && styles.readOnlyInput}
          disabled={this.props.readOnly}
        >
          {placeHolder}
          {options}
        </Input>
      );
    }
  },

  handleErrorClick: function (i) {
    var errors = _.cloneDeep(this.state.errors);
    errors.splice(i,1);
    this.setState({errors: errors});
  },

  renderErrors: function () {
    if (!this.state.errors || this.state.errors.length === 0) {
      return null;
    }
    return this.state.errors.map(function (error, i) {
      return (
        <Alert
          bsStyle="danger"
          key={i}
          onDismiss={this.handleErrorClick.bind(null, i)}
        >
          {error}
        </Alert>
      );
    }.bind(this));
  },

  shouldConfirmSave: function () {
    if (!this.props.workshop) {
      return false;
    }
    return (
      this.state.sessionsModified ||
      this.state.location_name !== this.props.workshop.location_name ||
      this.state.location_address !== this.props.workshop.location_address ||
      this.state.notes !== this.props.workshop.notes
    );
  },

  handleSaveClick: function (e) {
    var validation = this.validate();
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

  handleSaveAndNotifyClick: function () {
    this.save(true);
  },

  handleSaveNoNotifyClick: function () {
    this.save(false);
  },

  handleAbortSave: function () {
    this.setState({showSaveConfirmation: false});
  },

  handleFieldChange: function (fieldName, value) {
    this.setState({[fieldName]: value});
  },

  handleCourseChange: function (event) {
    var course = event.target.value;
    this.handleFieldChange('course', course);

    // clear facilitators and subject
    this.setState({facilitators: [], subject: null});
    this.loadAvailableFacilitators(course);
  },

  save: function (notify = false) {
    var data = {
      facilitators: this.prepareFacilitatorsForApi(this.state.facilitators),
      location_name: this.state.location_name,
      location_address: this.state.location_address,
      capacity: this.state.capacity,
      workshop_type: this.state.workshop_type,
      course: this.state.course,
      subject: this.state.subject,
      notes: this.state.notes,
      sessions_attributes: this.prepareSessionsForApi(this.state.sessions, this.state.destroyedSessions),
      notify: notify
    };

    var method, url;
    if (this.props.workshop) {
      data.id = this.props.workshop.id;
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
      data: JSON.stringify({pd_workshop: data})
    }).done(function (data) {
      if (this.props.onSaved) {
        this.props.onSaved(data);
      }
    }.bind(this)).fail(function (data) {
      if (data.responseJSON.errors) {
        this.setState({
          errors: data.responseJSON.errors,
          showSaveConfirmation: false
        });
      }
    }.bind(this));
  },

  handleCancelClick: function (e) {
    // discard changes.
    this.context.router.goBack();
  },

  renderFormButtons: function () {
    if (this.props.readOnly) {
      return null;
    }

    var saveText = this.props.workshop ? 'Save' : 'Publish';
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

  render: function () {
    if (this.state.loading) {
      return <i className="fa fa-spinner fa-pulse fa-3x" />;
    }
    return this.renderForm();
  },

  validate: function (shouldValidate = true) {
    var validation = {isValid: true, style: {}, help: {}};
    if (shouldValidate) {
      for (var i = 0; i < this.state.sessions.length; i++) {
        var session = this.state.sessions[i];
        if (!session.date || !moment(session.date, 'MM/DD/YY').isValid() ||
          !session.startTime || !session.endTime) {
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

  renderForm: function () {
    let validation = this.validate(this.state.shouldValidate);
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
              <Input
                type="text"
                label="Location Name"
                value={this.state.location_name || ''}
                onChange={(event) => {this.handleFieldChange('location_name', event.target.value);}}
                bsStyle={validation.style.location_name}
                help={validation.help.location_name}
                maxLength={255}
                style={this.props.readOnly && styles.readOnlyInput}
                disabled={this.props.readOnly}
              />
            </Col>
            <Col sm={6}>
              <Input
                type="text"
                key={this.state.useAutocomplete} // Change key to force re-draw
                className="location-autocomplete"
                label="Location Address"
                value={this.state.location_address || ''}
                placeholder="Enter a location"
                onChange={(event) => {this.handleFieldChange('location_address', event.target.value);}}
                bsStyle={validation.style.location_address}
                help={validation.help.location_address}
                maxLength={255}
                style={this.props.readOnly && styles.readOnlyInput}
                disabled={this.props.readOnly}
              />
            </Col>
          </Row>
          <Row>
            <Col sm={2}>
              <Input
                type="text"
                label="Capacity"
                value={this.state.capacity || ''}
                onChange={(event) => {this.handleFieldChange('capacity', event.target.value);}}
                bsStyle={validation.style.capacity}
                help={validation.help.capacity}
                maxLength={4}
                style={this.props.readOnly && styles.readOnlyInput}
                disabled={this.props.readOnly}
              />
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
              <Input
                type="textarea"
                label="Notes (optional)"
                placeholder="Use this space to tell teachers any important
                information like building location, lunch options or pre-work."
                value={this.state.notes || ''}
                onChange={(event) => {this.handleFieldChange('notes', event.target.value);}}
                maxLength={65535}
                rows={Math.max(5, this.state.notes.split("\n").length + 1)}
                style={this.props.readOnly && styles.readOnlyInput}
                disabled={this.props.readOnly}
              />
            </Col>
          </Row>
          <FacilitatorListFormPart
            availableFacilitators={this.state.availableFacilitators}
            facilitators={this.state.facilitators}
            course={this.state.course}
            onChange={this.handleFacilitatorsChange}
            readOnly={this.props.readOnly}
          />
          {this.renderFormButtons()}
          {this.props.children}
        </form>
      </Grid>
    );
  }
});
module.exports = WorkshopForm;
