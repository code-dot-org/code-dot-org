/**
 * Form for creating / editing workshop details.
 */
import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
/* eslint-disable no-restricted-imports */
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
  Alert,
} from 'react-bootstrap';
/* eslint-enable no-restricted-imports */
import {connect} from 'react-redux';
import Select from 'react-select';

import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {
  ActiveCourseWorkshops,
  Subjects,
  SubjectNames,
  HideFeeInformationSubjects,
  HideOnWorkshopMapSubjects,
  HideFundedSubjects,
  VirtualOnlySubjects,
  NotFundedSubjects,
  MustSuppressEmailSubjects,
} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import HelpTip from '@cdo/apps/legacySharedComponents/HelpTip';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

import MapboxLocationSearchField from '../../../../templates/MapboxLocationSearchField';
import Spinner from '../../components/spinner';
import {
  PermissionPropType,
  WorkshopAdmin,
  Organizer,
  ProgramManager,
  CsfFacilitator,
} from '../permission';
import {
  TIME_FORMAT,
  DATE_FORMAT,
  DATETIME_FORMAT,
  COURSE_BUILD_YOUR_OWN,
} from '../workshopConstants';

import CourseSelect from './CourseSelect';
import FacilitatorListFormPart from './facilitator_list_form_part';
import ModuleSelect from './ModuleSelect';
import OrganizerFormPart from './organizer_form_part';
import SessionListFormPart from './session_list_form_part';
import SubjectSelect from './SubjectSelect';

// Default to today, 9am-5pm.
const placeholderSession = {
  placeholderId: '_0',
  date: moment().format(DATE_FORMAT),
  startTime: '9:00am',
  endTime: '5:00pm',
};

let ALL_PL_TOPICS = {};
const INPUT_HEIGHT = 34;

// When selecting whether a workshop is virtual through the UI,
// a user is really selecting two things:
//  a) whether the workshop is occurring virtually, and
//  b) if there's a third party responsible for the content/structure of the workshop.
// These two things are stored as separate attributes in the workshop model.
const virtualWorkshopTypes = ['regional', 'friday_institute'];
const thirdPartyProviders = ['friday_institute'];

export class WorkshopForm extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    permission: PermissionPropType.isRequired,
    facilitatorCourses: PropTypes.arrayOf(PropTypes.string).isRequired,
    workshop: PropTypes.shape({
      id: PropTypes.number.isRequired,
      facilitators: PropTypes.array.isRequired,
      location_name: PropTypes.string.isRequired,
      location_address: PropTypes.string,
      capacity: PropTypes.number.isRequired,
      on_map: PropTypes.bool.isRequired,
      funded: PropTypes.bool.isRequired,
      funding_type: PropTypes.string,
      course: PropTypes.string.isRequired,
      subject: PropTypes.string,
      fee: PropTypes.string,
      notes: PropTypes.string,
      sessions: PropTypes.array.isRequired,
      enrolled_teacher_count: PropTypes.number.isRequired,
      regional_partner_name: PropTypes.string,
      regional_partner_id: PropTypes.number,
      virtual: PropTypes.bool,
      third_party_provider: PropTypes.string,
      suppress_email: PropTypes.bool,
      organizer: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      }),
      module: PropTypes.string,
      course_offerings: PropTypes.array,
    }),
    onSaved: PropTypes.func,
    today: PropTypes.instanceOf(Date),
    readOnly: PropTypes.bool,
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = this.computeInitialState(props);
  }

  computeInitialState(props) {
    let initialState = {
      errors: [],
      shouldValidate: false,
      facilitators: [],
      location_name: '',
      location_address: '',
      capacity: '',
      on_map: false,
      funded: '',
      funding_type: null,
      course: '',
      subject: '',
      module: '',
      fee: null,
      notes: '',
      sessions: [placeholderSession],
      destroyedSessions: [],
      availableFacilitators: [],
      showSaveConfirmation: false,
      showTypeOptionsHelpDisplay: false,
      regional_partner_id: '',
      virtual: false,
      suppress_email: false,
      third_party_provider: null,
      course_offerings: [],
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
          'module',
          'fee',
          'notes',
          'regional_partner_id',
          'organizer',
          'virtual',
          'suppress_email',
          'third_party_provider',
          'course_offerings',
        ])
      );
      initialState.sessions = this.prepareSessionsForForm(
        props.workshop.sessions
      );
      this.loadAvailableFacilitators(props.workshop.course);
    }

    this.loadPlCourseOfferings();
    this.loadRegionalPartners();
    return initialState;
  }

  componentWillUnmount() {
    if (this.saveRequest) {
      this.saveRequest.abort();
    }
    if (this.loadWorkshopRequest) {
      this.loadWorkshopRequest.abort();
    }
    if (this.loadRegionalPartnersRequest) {
      this.loadRegionalPartnersRequest.abort();
    }
    if (this.loadPlCoursesRequest) {
      this.loadPlCoursesRequest.abort();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.readOnly && !this.props.readOnly) {
      this.setState(this.computeInitialState(this.props));
    }
  }

  loadAvailableFacilitators(course) {
    this.loadWorkshopRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/pd/course_facilitators?course=${course}`,
      dataType: 'json',
    }).done(data => {
      this.setState({availableFacilitators: data});
    });
  }

  loadRegionalPartners() {
    this.loadRegionalPartnersRequest = $.ajax({
      method: 'GET',
      url: '/api/v1/regional_partners',
      dataType: 'json',
    }).done(data => {
      this.setState({
        regionalPartners: data,
      });
    });
  }

  loadPlCourseOfferings() {
    this.loadPlCoursesRequest = $.ajax({
      method: 'GET',
      url: `/course_offerings/self_paced_pl_course_offerings`,
      dataType: 'json',
    }).done(data => {
      ALL_PL_TOPICS = data;
    });
  }

  // Convert from [start, end] to [date, startTime, endTime]
  prepareSessionsForForm(sessions) {
    return sessions.map(session => {
      return {
        id: session.id,
        date: moment.utc(session.start).format(DATE_FORMAT),
        startTime: moment.utc(session.start).format(TIME_FORMAT),
        endTime: moment.utc(session.end).format(TIME_FORMAT),
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
            .format(),
        };
      })
      .concat(
        destroyedSessions.map(destroyedSession => {
          return {
            id: destroyedSession.id,
            _destroy: true,
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
      destroyedSessions,
    });
  };

  handleFacilitatorsChange = facilitators => {
    this.setState({facilitators: facilitators});
  };

  handleOrganizerChange = event => {
    this.setState({organizer: {id: parseInt(event.target.value)}});
  };

  renderOnMapRadios(validation) {
    return (
      <FormGroup validationState={validation.style.on_map}>
        <ControlLabel>Should this appear on the K-5 workshop map?</ControlLabel>
        <FormGroup id="on_map">
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
          text: 'Yes, it is funded. Please pay the Regional Partner.',
        },
        {
          value: {funded: true, funding_type: 'facilitator'},
          text: 'Yes, it is funded. Please pay the Facilitator directly.',
        }
      );
    } else if (this.state.subject !== 'Workshop for Returning Teachers') {
      options.push({
        value: {funded: true, funding_type: null},
        text: 'Yes, it is funded.',
      });
    }
    options.push({
      value: {funded: false, funding_type: null},
      text: 'No, it is not funded.',
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

  // For summer workshops for CSP and CSA, only workshop admins can change
  // the “Is this a virtual workshop” field within one month of the workshop
  // in order to prevent people from changing this last minute without
  // talking to us or the Friday institute.
  checkCannotChangeIfWorkshopVirtual() {
    return (
      (this.state.course === ActiveCourseWorkshops.CSP ||
        this.state.course === ActiveCourseWorkshops.CSA) &&
      this.state.subject === SubjectNames.SUBJECT_SUMMER_WORKSHOP &&
      !this.props.permission.has(WorkshopAdmin) &&
      this.state.sessions.some(this.sessionStartsWithinMonth)
    );
  }

  // Returns whether today is within a month before the given session (a month
  // is represented as 30 days here for consistency and to align with behavior
  // in workshop_controller.rb).
  sessionStartsWithinMonth = session => {
    const today = this.props.today;
    const workshopDate = new Date(session.date);
    const monthBeforeWorkshopDate = new Date(
      workshopDate.getFullYear(),
      workshopDate.getMonth(),
      workshopDate.getDate() - 30
    );
    return monthBeforeWorkshopDate <= today && today <= workshopDate;
  };

  renderWorkshopTypeOptions(validation) {
    const isCsf = this.state.course === 'CS Fundamentals';
    const isAdminCounselor = this.state.course === 'Admin/Counselor Workshop';
    const isBuildYourOwnWorkshop = this.state.course === COURSE_BUILD_YOUR_OWN;
    const showFeeInput =
      isCsf &&
      this.state.subject &&
      !HideFeeInformationSubjects.includes(this.state.subject);
    const showMapChoice =
      isCsf &&
      this.state.subject &&
      !HideOnWorkshopMapSubjects.includes(this.state.subject);
    const isCsfSubjectWithHiddenFundedField =
      isCsf &&
      this.state.subject &&
      HideFundedSubjects.includes(this.state.subject);
    const showFundedInput = !(
      isAdminCounselor ||
      isCsfSubjectWithHiddenFundedField ||
      isBuildYourOwnWorkshop
    );
    const virtualWorkshopHelpTip = this.checkCannotChangeIfWorkshopVirtual() ? (
      <p>
        There is less than a month until your workshop. Please contact
        partner@code.org to update this setting.
      </p>
    ) : (
      <p>Please update your selection if/when your plans change.</p>
    );

    return (
      <FormGroup>
        <ControlLabel>
          Workshop Type Options&nbsp;
          {isCsf && (
            <a id="helpLink" onClick={this.toggleTypeOptionsHelpDisplay}>
              (help)
            </a>
          )}
        </ControlLabel>
        <div style={{height: 7}}>&nbsp;</div>
        {this.state.showTypeOptionsHelpDisplay && isCsf && (
          <FormGroup id="helpTextDisplay">
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
            <Row>
              {showFeeInput && (
                <Col sm={6}>{this.renderFeeInput(validation)}</Col>
              )}
            </Row>
            {showMapChoice && this.renderOnMapRadios(validation)}
            {/* A small gap to resemble the gap below the fee input. */}
            {showFeeInput && <div style={{height: 7}}>&nbsp;</div>}
            {showFundedInput && this.renderFundedSelect(validation)}
          </Col>
        </Row>
        <Row>
          <Col sm={5}>
            <FormGroup validationState={validation.style.virtual}>
              <ControlLabel>
                Is this a virtual workshop?
                <HelpTip>{virtualWorkshopHelpTip}</HelpTip>
              </ControlLabel>
              <SelectIsVirtual
                value={this.currentVirtualStatus()}
                onChange={this.handleVirtualChange}
                readOnly={
                  this.props.readOnly ||
                  VirtualOnlySubjects.includes(this.state.subject) ||
                  this.checkCannotChangeIfWorkshopVirtual()
                }
                showVirtualOptions={
                  !!this.props.workshop ||
                  !this.checkCannotChangeIfWorkshopVirtual()
                }
              />
              <HelpBlock>{validation.help.virtual}</HelpBlock>
            </FormGroup>
          </Col>
          {!isBuildYourOwnWorkshop && (
            <Col sm={5}>
              <FormGroup validationState={validation.style.suppress_email}>
                <ControlLabel>
                  Enable workshop reminders?
                  <HelpTip>
                    <p>
                      Choose if you'd like automated 10-day and 3-day
                      pre-workshop reminders to be sent to your participants.
                    </p>
                  </HelpTip>
                </ControlLabel>
                <SelectSuppressEmail
                  onChange={this.handleSuppressEmailChange}
                  value={this.state.suppress_email || false}
                  readOnly={
                    this.props.readOnly ||
                    MustSuppressEmailSubjects.includes(this.state.subject)
                  }
                />
                <HelpBlock>{validation.help.suppress_email}</HelpBlock>
              </FormGroup>
            </Col>
          )}
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
          label: partner.name,
        }))
      );
    } else if (this.props.workshop) {
      // Display the currently selected partner name, even if the list hasn't yet loaded.
      options.push({
        value: this.props.workshop.regional_partner_id || '',
        label: this.props.workshop.regional_partner_name,
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

  renderFeeInput(validation) {
    // If state.fee is null, there is no fee and no custom fee message.
    // If state.fee is '', the user needs to provide a custom fee message.

    const customizeFee = this.state.fee !== null;

    return (
      <FormGroup validationState={validation.style.fee}>
        <ControlLabel>Fee information for participants</ControlLabel>

        <div style={styles.noFeeContainer}>
          <Radio
            checked={!customizeFee}
            inline
            name="customize_fee"
            value="no"
            onChange={this.handleCustomizeFeeChange}
            style={this.getInputStyle()}
            disabled={this.props.readOnly}
          >
            No cost!
          </Radio>
        </div>

        <div>
          <Radio
            checked={customizeFee}
            inline
            name="customize_fee"
            value="yes"
            onChange={this.handleCustomizeFeeChange}
            style={{...this.getInputStyle(), ...styles.yesFeeRadio}}
            disabled={this.props.readOnly}
          >
            <FormControl
              type="text"
              value={this.state.fee || ''}
              id="fee"
              name="fee"
              onChange={this.handleFieldChange}
              maxLength={30}
              style={this.getInputStyle()}
              disabled={this.props.readOnly || !customizeFee}
              placeholder="Fee information"
            />
            <HelpBlock>{validation.help.fee}</HelpBlock>
          </Radio>
        </div>
      </FormGroup>
    );
  }

  getInputStyle() {
    return (this.props.readOnly && styles.readOnlyInput) || null;
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

    // Don't ask if admins want to send updates with workshop changes for virtual workshops.
    // Update emails are suppressed for virtual workshops.
    if (this.state.virtual) {
      return false;
    }

    // If location address is modified, then returned to blank,
    // this.state.location_address is a blank string instead of null.
    return (
      this.state.sessionsModified ||
      this.state.location_name !== workshop.location_name ||
      (this.state.location_address === ''
        ? null
        : this.state.location_address) !== workshop.location_address ||
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

  // Selects the given value in the topic dropdown
  handleTopicSelect = (id, isChecked) => {
    let updatedTopics;
    if (isChecked) {
      // Add checked item into list
      updatedTopics = [...this.state.course_offerings, id];
    } else {
      // Remove unchecked item from list
      updatedTopics = this.state.course_offerings.filter(item => item !== id);
    }
    this.setState({course_offerings: updatedTopics});
  };

  handleLocationChange = event => {
    const location = event && event.target && event.target.value;
    this.setState({location_address: location});
    return location;
  };

  currentVirtualStatus = () => {
    const {virtual, third_party_provider} = this.state;

    // First, check if the third party provider is a valid
    // virtual workshop type.
    if (virtualWorkshopTypes.includes(third_party_provider)) {
      return third_party_provider;
    } else if (virtual) {
      return 'regional';
    } else {
      return 'in_person';
    }
  };

  handleVirtualChange = event => {
    // This field gets its own handler so we can coerce its value to boolean
    const value = event.target.value;
    const virtual = virtualWorkshopTypes.includes(value);

    this.setState({
      virtual,
      third_party_provider: thirdPartyProviders.includes(value) ? value : null,
    });
  };

  handleSuppressEmailChange = event => {
    // This field gets its own handler so we can coerce its value to boolean
    // before we save it to React state.
    const suppress_email = event.target.value === 'true';
    this.setState({suppress_email});
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

    // clear facilitators, subject, module, funding, and email reminders
    this.setState({
      facilitators: [],
      subject: null,
      fee: null,
      funded: '',
      funding_type: null,
      suppress_email: false,
      module: null,
      course_offerings: [],
    });
    this.loadAvailableFacilitators(course);
    if (course === COURSE_BUILD_YOUR_OWN) {
      this.setState({funded: false, suppress_email: true});
    }
  };

  handleSubjectChange = event => {
    const subject = this.handleFieldChange(event);

    if (
      HideFundedSubjects.includes(subject) ||
      NotFundedSubjects.includes(subject)
    ) {
      this.setState({
        funded: false,
      });
    }

    if (VirtualOnlySubjects.includes(subject)) {
      this.setState({
        virtual: true,
      });
    }

    if (MustSuppressEmailSubjects.includes(subject)) {
      this.setState({
        suppress_email: true,
      });
    } else {
      this.setState({
        suppress_email: false,
      });
    }

    this.setState({
      module: null,
    });
  };

  handleCustomizeFeeChange = event => {
    const customizeFee = event.target.value === 'yes';
    const fee = customizeFee ? '' : null;

    this.setState({
      fee,
    });
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
      module: this.state.module,
      fee: this.state.fee ? this.state.fee : null,
      notes: this.state.notes,
      virtual: this.state.virtual,
      suppress_email: this.state.suppress_email,
      third_party_provider: this.state.third_party_provider,
      sessions_attributes: this.prepareSessionsForApi(
        this.state.sessions,
        this.state.destroyedSessions
      ),
      regional_partner_id: this.state.regional_partner_id,
      course_offerings: this.state.course_offerings,
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
      data: JSON.stringify({pd_workshop: workshop_data, notify}),
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
            showSaveConfirmation: false,
          });
        }
      });
  }

  handleCancelClick = () => {
    // discard changes.
    this.context.router.goBack();
  };

  // Collapse dropdown if 'Escape' is pressed
  onKeyDown(e) {
    if (e.keyCode === 27) {
      e.currentTarget.classList.remove('open');
    }
  }

  shouldShowFacilitators() {
    return !['Counselor', 'Admin'].includes(this.state.course);
  }

  shouldRenderModules() {
    return this.state.subject === SubjectNames['SUBJECT_CUSTOM_WORKSHOP'];
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
      showTypeOptionsHelpDisplay: !this.state.showTypeOptionsHelpDisplay,
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
      if (
        this.state.course &&
        this.state.course === COURSE_BUILD_YOUR_OWN &&
        this.state.course_offerings.length === 0
      ) {
        validation.isValid = false;
        validation.style.course_offerings = 'error';
        validation.help.course_offerings = 'Required.';
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
      if (this.state.fee === '') {
        validation.isValid = false;
        validation.style.fee = 'error';
        validation.help.fee = 'Required';
      }
      if (this.shouldRenderModules() && !this.state.module) {
        validation.isValid = false;
        validation.style.module = 'error';
        validation.help.module = 'Required.';
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
              <FormGroup>
                <ControlLabel>Location Address (optional)</ControlLabel>
                <MapboxLocationSearchField
                  placeholder="Enter a location"
                  onChange={this.handleLocationChange}
                  value={this.state.location_address || ''}
                  readOnly={this.props.readOnly}
                  style={this.getInputStyle()}
                  className={'form-control'}
                />
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
            <Col sm={4}>
              <CourseSelect
                course={this.state.course}
                facilitatorCourses={this.props.facilitatorCourses}
                permission={this.props.permission}
                readOnly={this.props.readOnly}
                inputStyle={this.getInputStyle()}
                validation={validation}
                onChange={this.handleCourseChange}
              />
            </Col>
            <Col sm={3}>
              {this.shouldRenderSubject() && (
                <SubjectSelect
                  course={this.state.course}
                  subject={this.state.subject}
                  readOnly={this.props.readOnly}
                  inputStyle={this.getInputStyle()}
                  validation={validation}
                  onChange={this.handleSubjectChange}
                />
              )}
            </Col>
          </Row>
          {this.state.course === COURSE_BUILD_YOUR_OWN && (
            <Row>
              <FormGroup validationState={validation.style.course_offerings}>
                <div style={styles.container}>
                  <div style={styles.extraMargin}>
                    <label>Select Workshop Topic(s)</label>
                    <div
                      className="dropdown show"
                      id={'course_offerings'}
                      onKeyDown={this.onKeyDown}
                    >
                      <button
                        style={{...styles.fullWidth, ...styles.topicsButton}}
                        className="btn btn-secondary dropdown-toggle"
                        id="dropdownMenuButton"
                        type="button"
                        data-toggle="dropdown"
                        aria-haspopup={true}
                        aria-label="pl Topics dropdown"
                        disabled={this.props.readOnly}
                      >
                        {this.state.course_offerings.length > 0 && (
                          <FontAwesome
                            style={styles.alignCenter}
                            id={'check-icon'}
                            icon="check-circle"
                            title={'course_offerings'}
                          />
                        )}
                        <div
                          style={{...styles.alignCenter, ...styles.buttonLabel}}
                        >
                          PL Topics
                        </div>
                        <FontAwesome
                          style={styles.icon}
                          id={'chevron-down-icon'}
                          icon={'chevron-down'}
                        />
                      </button>
                      <div
                        className={'dropdown-menu'}
                        style={styles.dropdown}
                        aria-labelledby="dropdownMenuButton"
                      >
                        <ul style={styles.listItems}>
                          {Object.values(ALL_PL_TOPICS).map(topic => (
                            <li style={styles.singleItem} key={topic.id}>
                              <Checkbox
                                name={topic.display_name}
                                label={topic.display_name}
                                checked={this.state.course_offerings.includes(
                                  topic.id
                                )}
                                onChange={e =>
                                  this.handleTopicSelect(
                                    topic.id,
                                    e.target.checked
                                  )
                                }
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <HelpBlock>{validation.help.course_offerings}</HelpBlock>
                  </div>
                </div>
              </FormGroup>
            </Row>
          )}
          <Row>
            <Col sm={5}>
              {this.shouldRenderModules() && (
                <ModuleSelect
                  course={this.state.course}
                  module={this.state.module}
                  readOnly={this.props.readOnly}
                  inputStyle={this.getInputStyle()}
                  validation={validation}
                  onChange={this.handleFieldChange}
                />
              )}
            </Col>
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
              workshopId={this.props.workshop.id}
              organizerId={this.state.organizer.id}
              organizerName={this.state.organizer.name}
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

const styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none',
  },
  noFeeContainer: {
    paddingBottom: 7,
  },
  yesFeeRadio: {
    width: '100%',
  },
  topicsButton: {
    border: `1px solid ${color.lighter_gray}`,
    display: 'flex',
    backgroundColor: 'white',
    height: INPUT_HEIGHT,
    fontWeight: 300,
    padding: 5,
    margin: '0 0 15px 0',
  },
  buttonLabel: {
    marginLeft: 10,
  },
  alignCenter: {
    alignSelf: 'center',
  },
  icon: {
    color: color.neutral_dark,
    fontSize: 'smaller',
    position: 'absolute',
    right: 5,
    top: 10,
    fontWeight: 100,
  },
  listItems: {
    margin: 10,
  },
  singleItem: {
    display: 'flex',
    padding: 5,
  },
  check: {
    position: 'relative',
    margin: '0',
    paddingLeft: '10px',
  },
  fullWidth: {
    width: '100%',
  },
  container: {
    margin: 15,
    backgroundColor: '#f7f7f7',
    width: '50%',
    display: 'inline-block',
  },
  extraMargin: {
    margin: '15px 15px 0 15px',
  },
  dropdown: {
    height: '300px',
    overflow: 'auto',
  },
};

export default connect(state => ({
  permission: state.workshopDashboard.permission,
  facilitatorCourses: state.workshopDashboard.facilitatorCourses,
}))(WorkshopForm);

const SelectIsVirtual = ({value, readOnly, onChange, showVirtualOptions}) => (
  <FormControl
    componentClass="select"
    value={value}
    id="virtual"
    name="virtual"
    onChange={onChange}
    style={readOnly ? styles.readOnlyInput : undefined}
    disabled={readOnly}
  >
    <option key={'in_person'} value={'in_person'}>
      No, this is an in-person workshop.
    </option>
    {showVirtualOptions && (
      <>
        <option key={'friday_institute'} value={'friday_institute'}>
          Yes, this is a Code.org-Friday Institute virtual workshop.
        </option>
        <option key={'regional'} value={'regional'}>
          Yes, this is a regional virtual workshop.
        </option>
      </>
    )}
  </FormControl>
);
SelectIsVirtual.propTypes = {
  value: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  showVirtualOptions: PropTypes.bool.isRequired,
};

const SelectSuppressEmail = ({value, readOnly, onChange}) => (
  <FormControl
    componentClass="select"
    value={value}
    id="suppress_email"
    name="suppress_email"
    onChange={onChange}
    style={readOnly ? styles.readOnlyInput : undefined}
    disabled={readOnly}
  >
    <option key={false} value={false}>
      Yes, send reminders on my behalf.
    </option>
    <option key={true} value={true}>
      No, I will remind enrollees myself.
    </option>
  </FormControl>
);
SelectSuppressEmail.propTypes = {
  value: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};
