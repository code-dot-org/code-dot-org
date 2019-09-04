/* global google */

/**
 * Form for creating / editing workshop details.
 */
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import moment from 'moment';
import Spinner from '../../components/spinner';
import SessionListFormPart from './session_list_form_part';
import FacilitatorListFormPart from './facilitator_list_form_part';
import OrganizerFormPart from './organizer_form_part';
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
  Radio,
  Alert
} from 'react-bootstrap';
import {TIME_FORMAT, DATE_FORMAT, DATETIME_FORMAT} from '../workshopConstants';
import {
  PermissionPropType,
  WorkshopAdmin,
  Organizer,
  Facilitator,
  ProgramManager,
  CsfFacilitator
} from '../permission';
import {
  Courses,
  Subjects
} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

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

export class WorkshopForm extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    permission: PermissionPropType.isRequired,
    facilitatorCourses: PropTypes.arrayOf(PropTypes.string).isRequired,
    workshop: PropTypes.shape({
      id: PropTypes.number.isRequired,
      facilitators: PropTypes.array.isRequired,
      location_name: PropTypes.string.isRequired,
      location_address: PropTypes.string.isRequired,
      capacity: PropTypes.number.isRequired,
      on_map: PropTypes.bool.isRequired,
      funded: PropTypes.bool.isRequired,
      funding_type: PropTypes.string,
      course: PropTypes.string.isRequired,
      subject: PropTypes.string,
      notes: PropTypes.string,
      sessions: PropTypes.array.isRequired,
      enrolled_teacher_count: PropTypes.number.isRequired,
      regional_partner_name: PropTypes.string,
      regional_partner_id: PropTypes.number,
      potential_organizers: PropTypes.array,
      organizer: PropTypes.shape({
        id: PropTypes.number
      })
    }),
    onSaved: PropTypes.func,
    readOnly: PropTypes.bool,
    children: PropTypes.node
  };

  constructor(props) {
    super(props);
    this.state = this.computeInitialState(props);
  }

  computeInitialState(props) {
    let initialState = {
      errors: [],
      shouldValidate: false,
      useAutocomplete: true,
      facilitators: [],
      location_name: '',
      location_address: '',
      capacity: '',
      on_map: false,
      funded: '',
      funding_type: null,
      course: '',
      subject: '',
      notes: '',
      sessions: [placeholderSession],
      destroyedSessions: [],
      availableFacilitators: [],
      showSaveConfirmation: false,
      showTypeOptionsHelpDisplay: false,
      regional_partner_id: ''
    };

    if (props.workshop) {
      initialState = _.merge(
        initialState,
        _.pick(props.workshop, [
          'facilitators',
          'location_name',
          'location_address',
          'capacity',
          'on_map',
          'funded',
          'funding_type',
          'course',
          'subject',
          'notes',
          'regional_partner_id',
          'organizer'
        ])
      );
      initialState.sessions = this.prepareSessionsForForm(
        props.workshop.sessions
      );
      this.loadAvailableFacilitators(props.workshop.course);
    }

    this.loadRegionalPartners();

    return initialState;
  }

  componentDidMount() {
    this.enableAutocompleteLocation();
  }

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

    if (this.loadRegionalPartnersRequest) {
      this.loadRegionalPartnersRequest.abort();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.readOnly && !this.props.readOnly) {
      this.setState(this.computeInitialState(this.props));
    }
  }

  componentDidUpdate() {
    this.enableAutocompleteLocation();
  }

  loadAvailableFacilitators(course) {
    this.loadWorkshopRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/pd/course_facilitators?course=${course}`,
      dataType: 'json'
    }).done(data => {
      this.setState({availableFacilitators: data});
    });
  }

  loadRegionalPartners() {
    this.loadRegionalPartnersRequest = $.ajax({
      method: 'GET',
      url: '/api/v1/regional_partners',
      dataType: 'json'
    }).done(data => {
      this.setState({
        regionalPartners: data
      });
    });
  }

  isGoogleMapsLoaded() {
    return typeof google === 'object' && typeof google.maps === 'object';
  }

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

    if (
      !this.autocomplete &&
      this.locationAddressControl &&
      this.isGoogleMapsLoaded()
    ) {
      this.autocomplete = new google.maps.places.Autocomplete(
        this.locationAddressControl
      );
      google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
        const place = this.autocomplete.getPlace();
        this.setState({location_address: place.formatted_address});
      });
    }
  }

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
  }

  // Convert from [date, startTime, endTime] to [start, end] and merge destroyedSessions
  prepareSessionsForApi(sessions, destroyedSessions) {
    return sessions
      .map(session => {
        return {
          id: session.id,
          start: moment
            .utc(session.date + ' ' + session.startTime, DATETIME_FORMAT)
            .format(),
          end: moment
            .utc(session.date + ' ' + session.endTime, DATETIME_FORMAT)
            .format()
        };
      })
      .concat(
        destroyedSessions.map(destroyedSession => {
          return {
            id: destroyedSession.id,
            _destroy: true
          };
        })
      );
  }

  // Convert from [id, name, email] to an array of ids.
  prepareFacilitatorsForApi(facilitators) {
    return facilitators.filter(f => f.id > 0).map(f => f.id);
  }

  handleSessionsChange = (sessions, removedSession) => {
    sessions = _.cloneDeep(sessions);
    const destroyedSessions = _.cloneDeep(this.state.destroyedSessions);
    if (removedSession && removedSession.id) {
      destroyedSessions.push(removedSession);
    }
    this.setState({
      sessionsModified: true,
      sessions,
      destroyedSessions
    });
  };

  handleFacilitatorsChange = facilitators => {
    this.setState({facilitators: facilitators});
  };

  handleOrganizerChange = event => {
    this.setState({organizer: {id: parseInt(event.target.value)}});
  };

  renderCourseSelect(validation) {
    let allowedCourses;
    if (
      this.props.permission.hasAny(Organizer, ProgramManager, WorkshopAdmin)
    ) {
      allowedCourses = Courses;
    } else if (this.props.permission.has(Facilitator)) {
      allowedCourses = this.props.facilitatorCourses;
    } else {
      console.error(
        'Insufficient permissions, expected one one of: Organizer, ProgramManager, WorkshopAdmin, or Facilitator'
      );
      allowedCourses = [];
    }

    const options = allowedCourses.map((course, i) => {
      return (
        <option key={i} value={course}>
          {course}
        </option>
      );
    });
    const placeHolder = this.state.course ? null : <option />;
    return (
      <FormGroup validationState={validation.style.course}>
        <ControlLabel>Course</ControlLabel>
        <FormControl
          componentClass="select"
          value={this.state.course || ''}
          id="course"
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
  }

  renderOnMapRadios(validation) {
    return (
      <FormGroup validationState={validation.style.on_map}>
        <ControlLabel>Should this appear on the K-5 workshop map?</ControlLabel>
        <FormGroup>
          <Radio
            checked={this.state.on_map}
            inline
            name="on_map"
            value="yes"
            onChange={this.handleRadioChange}
            style={this.getInputStyle()}
            disabled={this.props.readOnly}
          >
            Yes
          </Radio>
          <Radio
            checked={!this.state.on_map}
            inline
            name="on_map"
            value="no"
            onChange={this.handleRadioChange}
            style={this.getInputStyle()}
            disabled={this.props.readOnly}
          >
            No
          </Radio>
        </FormGroup>
        <HelpBlock>{validation.help.on_map}</HelpBlock>
      </FormGroup>
    );
  }

  renderFundedSelect(validation) {
    const options = [];
    if (this.state.course === 'CS Fundamentals') {
      options.push(
        {
          value: {funded: true, funding_type: 'partner'},
          text: 'Yes, it is funded. Please pay the Regional Partner.'
        },
        {
          value: {funded: true, funding_type: 'facilitator'},
          text: 'Yes, it is funded. Please pay the Facilitator directly.'
        }
      );
    } else {
      options.push({
        value: {funded: true, funding_type: null},
        text: 'Yes, it is funded.'
      });
    }
    options.push({
      value: {funded: false, funding_type: null},
      text: 'No, it is not funded.'
    });
    const value = JSON.stringify(
      _.pick(this.state, ['funded', 'funding_type'])
    );

    return (
      <Row>
        <Col sm={6}>
          <FormGroup validationState={validation.style.funded}>
            <ControlLabel>Is this a Code.org paid workshop?</ControlLabel>
            <FormControl
              componentClass="select"
              id="funded"
              name="funded"
              value={value}
              onChange={this.handleFundingChange}
              style={this.getInputStyle()}
              disabled={this.props.readOnly}
            >
              <option />
              {options.map((o, i) => (
                <option key={i} value={JSON.stringify(o.value)}>
                  {o.text}
                </option>
              ))}
            </FormControl>
            <HelpBlock>{validation.help.funded}</HelpBlock>
          </FormGroup>
        </Col>
      </Row>
    );
  }

  shouldRenderSubject() {
    return this.state.course && Subjects[this.state.course];
  }

  renderWorkshopTypeOptions(validation) {
    const isCsf = this.state.course === 'CS Fundamentals';
    const showMapChoice = isCsf;

    return (
      <FormGroup>
        <ControlLabel>
          Workshop Type Options&nbsp;
          {isCsf && <a onClick={this.toggleTypeOptionsHelpDisplay}>(help)</a>}
        </ControlLabel>
        {this.state.showTypeOptionsHelpDisplay && isCsf && (
          <FormGroup>
            <p>
              If you’d like to make your workshop open to the public, select Yes
              to show it on the K-5 workshop map.
            </p>
            <p>
              Next, please specify if this is a Code.org paid workshop. If it is
              a Code.org paid workshop, select whether payment should be made
              directly to the Facilitator or if the Regional Partner selected is
              responsible for payments to the Facilitator.
            </p>
          </FormGroup>
        )}
        <Row>
          <Col smOffset={1}>
            {showMapChoice && this.renderOnMapRadios(validation)}
            {this.renderFundedSelect(validation)}
          </Col>
        </Row>
      </FormGroup>
    );
  }

  renderRegionalPartnerSelect() {
    const editDisabled =
      this.props.readOnly ||
      // Enabled for these permissions
      (!this.props.permission.hasAny(
        WorkshopAdmin,
        Organizer,
        ProgramManager
      ) &&
        // Enabled for CSF facilitators when they are creating a new workshop
        !(this.props.permission.has(CsfFacilitator) && !this.props.workshop));

    const options = [];
    if (
      this.props.permission.has(CsfFacilitator) ||
      this.props.permission.has(WorkshopAdmin)
    ) {
      options.push({value: '', label: 'None'});
    }

    if (this.state.regionalPartners) {
      const sortedPartners = _.sortBy(
        this.state.regionalPartners,
        partner => partner.name
      );
      options.push(
        ...sortedPartners.map(partner => ({
          value: partner.id,
          label: partner.name
        }))
      );
    } else if (this.props.workshop) {
      // Display the currently selected partner name, even if the list hasn't yet loaded.
      options.push({
        value: this.props.workshop.regional_partner_id || '',
        label: this.props.workshop.regional_partner_name
      });
    }

    return (
      <FormGroup>
        <ControlLabel>Regional Partner</ControlLabel>
        {options.length > 1 && (
          <Select
            id="regional-partner-select"
            name="regional_partner_id"
            onChange={this.handleRegionalPartnerSelect}
            style={this.getInputStyle()}
            value={this.state.regional_partner_id || ''}
            options={options}
            // Facilitators (who are not organizers, partners, nor admins) cannot edit this field
            disabled={editDisabled}
          />
        )}
        {options.length === 1 && (
          <p id="regional-partner-name">{options[0].label}</p>
        )}
      </FormGroup>
    );
  }

  renderSubjectSelect(validation) {
    if (this.shouldRenderSubject()) {
      const options = Subjects[this.state.course]
        .filter(subject => {
          // Only a WorkshopAdmin should be shown a Virtual workshop.
          return (
            subject.indexOf('Virtual') === -1 ||
            this.props.permission.has(WorkshopAdmin)
          );
        })
        .map((subject, i) => {
          return (
            <option key={i} value={subject}>
              {subject}
            </option>
          );
        });
      const placeHolder = this.state.subject ? null : <option />;
      return (
        <FormGroup validationState={validation.style.subject}>
          <ControlLabel>Subject</ControlLabel>
          <FormControl
            componentClass="select"
            value={this.state.subject || ''}
            id="subject"
            name="subject"
            onChange={this.handleFieldChange}
            style={this.getInputStyle()}
            disabled={this.props.readOnly}
          >
            {placeHolder}
            {options}
          </FormControl>
          <HelpBlock>{validation.help.subject}</HelpBlock>
        </FormGroup>
      );
    }
  }

  getInputStyle() {
    return this.props.readOnly && styles.readOnlyInput;
  }

  handleErrorClick = i => {
    const errors = _.cloneDeep(this.state.errors);
    errors.splice(i, 1);
    this.setState({errors: errors});
  };

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
  }

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
  }

  handleSaveClick = () => {
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
  };

  handleSaveAndNotifyClick = () => {
    this.save(true);
  };

  handleSaveNoNotifyClick = () => {
    this.save(false);
  };

  handleAbortSave = () => {
    this.setState({showSaveConfirmation: false});
  };

  // Determines which field to update based on the target's name attribute. Returns new value.
  handleFieldChange = event => {
    const fieldName = $(event.target).attr('name');
    if (!fieldName) {
      console.error('Expected name attribute on handleFieldChange target.');
      return null;
    }

    const value = event.target.value;
    this.setState({[fieldName]: value});
    return value;
  };

  handleRegionalPartnerSelect = selection => {
    this.setState({regional_partner_id: selection ? selection.value : null});
  };

  handleRadioChange = event => {
    const fieldName = $(event.target).attr('name');
    if (!fieldName) {
      console.error('Expected name attribute on handleRadioChange target.');
      return null;
    }

    const enabled = event.target.value === 'yes';
    this.setState({[fieldName]: enabled});
    return enabled;
  };

  handleFundingChange = event => {
    const {funded, funding_type} = JSON.parse(event.target.value);
    this.setState({funded, funding_type});
  };

  handleCourseChange = event => {
    const course = this.handleFieldChange(event);

    // clear facilitators, subject, and funding
    this.setState({
      facilitators: [],
      subject: null,
      funded: '',
      funding_type: null
    });
    this.loadAvailableFacilitators(course);
  };

  save(notify = false) {
    const workshop_data = {
      facilitators: this.prepareFacilitatorsForApi(this.state.facilitators),
      location_name: this.state.location_name,
      location_address: this.state.location_address,
      capacity: this.state.capacity,
      on_map: this.state.on_map,
      funded: this.state.funded,
      funding_type: this.state.funding_type,
      course: this.state.course,
      subject: this.state.subject,
      notes: this.state.notes,
      sessions_attributes: this.prepareSessionsForApi(
        this.state.sessions,
        this.state.destroyedSessions
      ),
      regional_partner_id: this.state.regional_partner_id
    };

    if (this.state.organizer) {
      workshop_data.organizer_id = this.state.organizer.id;
    }

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
    })
      .done(data => {
        if (this.props.onSaved) {
          this.props.onSaved(data);
        }
      })
      .fail(data => {
        if (data.responseJSON.errors) {
          this.setState({
            errors: data.responseJSON.errors,
            showSaveConfirmation: false
          });
        }
      });
  }

  handleCancelClick = () => {
    // discard changes.
    this.context.router.goBack();
  };

  shouldShowFacilitators() {
    return !['Counselor', 'Admin'].includes(this.state.course);
  }

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
            <Button
              bsStyle="primary"
              id="workshop-form-save-btn"
              onClick={this.handleSaveClick}
            >
              {saveText}
            </Button>
            <Button onClick={this.handleCancelClick}>Cancel</Button>
          </ButtonToolbar>
          <Modal
            show={this.state.showSaveConfirmation}
            onHide={this.handleAbortSave}
          >
            <Modal.Header closeButton>
              <Modal.Title>Workshop Updated.</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              You updated important information regarding your workshop. Do you
              want to email an update?
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="primary" onClick={this.handleSaveAndNotifyClick}>
                Email
              </Button>
              <Button onClick={this.handleSaveNoNotifyClick}>
                Don't Email
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    );
  }

  toggleTypeOptionsHelpDisplay = () => {
    this.setState({
      showTypeOptionsHelpDisplay: !this.state.showTypeOptionsHelpDisplay
    });
  };

  render() {
    if (this.state.loading) {
      return <Spinner />;
    }
    return this.renderForm();
  }

  validate(shouldValidate = true) {
    const validation = {isValid: true, style: {}, help: {}};
    if (shouldValidate) {
      for (let i = 0; i < this.state.sessions.length; i++) {
        const session = this.state.sessions[i];
        if (
          !session.date ||
          !moment(session.date, DATE_FORMAT).isValid() ||
          !session.startTime ||
          !moment(session.startTime, TIME_FORMAT).isValid() ||
          !session.endTime ||
          !moment(session.endTime, TIME_FORMAT).isValid()
        ) {
          validation.isValid = false;
        }
      }
      if (!this.state.location_name) {
        validation.isValid = false;
        validation.style.location_name = 'error';
        validation.help.location_name = 'Required.';
      }
      if (!this.state.location_address) {
        validation.isValid = false;
        validation.style.location_address = 'error';
        validation.help.location_address = 'Required.';
      }
      if (!this.state.capacity) {
        validation.isValid = false;
        validation.style.capacity = 'error';
        validation.help.capacity = 'Required.';
      } else if (!/^[1-9]\d*$/.test(this.state.capacity)) {
        validation.isValid = false;
        validation.style.capacity = 'error';
        validation.help.capacity = 'Must be a positive integer.';
      }
      if (!this.state.course) {
        validation.isValid = false;
        validation.style.course = 'error';
        validation.help.course = 'Required.';
      }
      if (this.shouldRenderSubject() && !this.state.subject) {
        validation.isValid = false;
        validation.style.subject = 'error';
        validation.help.subject = 'Required.';
      }
      if (this.state.funded === '') {
        validation.isValid = false;
        validation.style.funded = 'error';
        validation.help.funded = 'Required';
      }
    }
    return validation;
  }

  renderForm() {
    const validation = this.validate(this.state.shouldValidate);

    return (
      <Grid>
        <form>
          <Row>
            <Col sm={4}>All workshop times are local:</Col>
          </Row>
          <SessionListFormPart
            sessions={this.state.sessions}
            onChange={this.handleSessionsChange}
            shouldValidate={this.state.shouldValidate}
            readOnly={this.props.readOnly}
          />
          <br />
          <Row>
            <Col sm={4}>
              <FormGroup validationState={validation.style.location_name}>
                <ControlLabel>Location Name</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.location_name || ''}
                  id="location_name"
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
                  ref={ref =>
                    (this.locationAddressControl = ReactDOM.findDOMNode(ref))
                  }
                  value={this.state.location_address || ''}
                  placeholder="Enter a location"
                  id="location_address"
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
                  id="capacity"
                  name="capacity"
                  onChange={this.handleFieldChange}
                  maxLength={4}
                  style={this.getInputStyle()}
                  disabled={this.props.readOnly}
                />
                <HelpBlock>{validation.help.capacity}</HelpBlock>
              </FormGroup>
            </Col>
            <Col sm={3}>{this.renderCourseSelect(validation)}</Col>
            <Col sm={3}>{this.renderSubjectSelect(validation)}</Col>
          </Row>
          <Row>
            <Col sm={10}>
              {this.state.course && this.renderWorkshopTypeOptions(validation)}
            </Col>
          </Row>
          <Row>
            <Col sm={10}>{this.renderRegionalPartnerSelect()}</Col>
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
                  id="notes"
                  name="notes"
                  onChange={this.handleFieldChange}
                  maxLength={65535}
                  rows={Math.max(
                    5,
                    this.state.notes && this.state.notes.split('\n').length + 1
                  )}
                  style={this.getInputStyle()}
                  disabled={this.props.readOnly}
                />
              </FormGroup>
            </Col>
          </Row>
          {this.shouldShowFacilitators() && (
            <FacilitatorListFormPart
              availableFacilitators={this.state.availableFacilitators}
              facilitators={this.state.facilitators}
              course={this.state.course}
              onChange={this.handleFacilitatorsChange}
              readOnly={this.props.readOnly}
            />
          )}
          {this.props.permission.has(WorkshopAdmin) && this.props.workshop && (
            <OrganizerFormPart
              potential_organizers={this.props.workshop.potential_organizers}
              organizer_id={this.state.organizer.id}
              onChange={this.handleOrganizerChange}
              readOnly={this.props.readOnly}
            />
          )}
          {this.renderFormButtons()}
          {this.props.children}
        </form>
      </Grid>
    );
  }
}

export default connect(state => ({
  permission: state.workshopDashboard.permission,
  facilitatorCourses: state.workshopDashboard.facilitatorCourses
}))(WorkshopForm);
