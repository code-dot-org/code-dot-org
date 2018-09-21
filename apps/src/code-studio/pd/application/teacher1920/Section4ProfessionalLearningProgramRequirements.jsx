import React from 'react';
import $ from "jquery";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import {
  styles as defaultStyles,
  PROGRAM_CSD,
  PROGRAM_CSP
} from "./TeacherApplicationConstants";
import Spinner from '../../components/spinner';
import color from '@cdo/apps/util/color';

const styles = {
  ...defaultStyles,
  error: {
    color: color.red
  }
};

export default class Section4SummerWorkshop extends LabeledFormComponent {
  static labels = PageLabels.section4ProfessionalLearningProgramRequirements;

  static associatedFields = [
    ...Object.keys(PageLabels.section4ProfessionalLearningProgramRequirements),
    "regionalPartnerId",
    "regionalPartnerGroup",
    "regionalPartnerWorkshopIds"
  ];

  state = {
    loadingPartner: true,
    partner: null,
    loadingAlternateWorkshops: false,
    alternateWorkshops: null,
    loadError: false
  };

  componentDidMount() {
    this.loadPartnerRequest = null;
    this.loadAlternateWorkshopsRequest = null;

    this.loadPartnerWorkshops();
    if (this.isUnableToAttendAssignedWorkshop()) {
      this.loadAlternateWorkshops();
    }
  }

  componentWillUnmount() {
    if (this.loadPartnerRequest) {
      this.loadPartnerRequest.abort();
    }
    if (this.loadAlternateWorkshopsRequest) {
      this.loadAlternateWorkshopsRequest.abort();
    }
  }

  loadPartnerWorkshops() {
    const locationParams = this.getWorkshopParams();
    if (this.props.data.school === '-1') {
      locationParams.zip_code = this.props.data.schoolZipCode;
      locationParams.state = this.props.data.schoolState;
    } else {
      locationParams.school = this.props.data.school;
    }

    const url = `/api/v1/pd/regional_partner_workshops/find?${$.param(locationParams)}`;
    this.loadPartnerRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    }).done(data => {
      this.loadPartnerRequest = null;

      this.handleChange({
        regionalPartnerId: data.id,
        regionalPartnerGroup: data.group,
        regionalPartnerWorkshopIds: (data.workshops || []).map(workshop => workshop.id)
      });

      // Update state with all the partner workshop data to display
      this.setState({
        loadingPartner: false,
        partnerWorkshops: data.workshops,
        regionalPartnerName: data.name
      });
    }).error(() => {
      this.setState({
        loadingPartner: false,
        loadError: true
      });
    });
  }

  loadAlternateWorkshops() {
    this.setState({loadingAlternateWorkshops: true});
    const url = `/api/v1/pd/regional_partner_workshops?${$.param(this.getWorkshopParams())}`;
    this.loadAlternateWorkshopsRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    }).done(data => {
      this.loadAlternateWorkshopsRequest = null;

      const alternateWorkshops = data.reduce((workshops, partner) => (
        partner.id === this.props.data.regionalPartnerId
          ? workshops
          : workshops.concat(
          // Add partner name to each alternate workshop
          partner.workshops.map(w => ({...w, partnerName: partner.name}))
          )
      ), []);

      this.setState({
        loadingAlternateWorkshops: false,
        alternateWorkshops
      });
    });
  }

  getWorkshopParams() {
    const course = {
      [PROGRAM_CSD]: 'CS Discoveries',
      [PROGRAM_CSP]: 'CS Principles'
    }[this.props.data.program];

    return {
      course,
      subject: '5-day Summer'
    };
  }

  isUnableToAttendAssignedWorkshop = (data = this.props.data) => data.regionalPartnerId && (
    data.ableToAttendSingle === TextFields.unableToAttend ||
    (
      data.ableToAttendMultiple &&
      data.ableToAttendMultiple.length === 1 &&
      data.ableToAttendMultiple[0] === TextFields.noExplain
    )
  );

  /**
   * @override
   */
  handleChange(newState) {
    const data = {...this.props.data, ...newState};
    if (this.isUnableToAttendAssignedWorkshop(data) && !this.state.alternateWorkshops && !this.loadAlternateWorkshopsRequest) {
      this.loadAlternateWorkshops();
    }

    super.handleChange(newState);
  }

  renderAbleToAttendSingle() {
    const options = [
      TextFields.ableToAttendSingle,
      TextFields.unableToAttend
    ];
    const textFieldMap = {[TextFields.unableToAttend]: 'explain'};
    return this.dynamicRadioButtonsWithAdditionalTextFieldsFor(
      "ableToAttendSingle",
      options,
      textFieldMap
    );
  }

  renderAssignedWorkshopList() {
    if (!this.props.data.regionalPartnerId) {
      return (
        <div>
          <p>
            <strong>There currently is no Regional Partner in your area. </strong>
            {this.renderAlternateWorkshopList()}
          </p>
        </div>
      );
    } else {
      if (this.state.partnerWorkshops.length === 0) {
        return (
          <h5>
            Your region’s assigned summer workshop is yet to be determined.
            More details will be provided if you are accepted into the program.
          </h5>
        );
      } else {
        return this.renderPartnerWorkshops();
      }
    }
  }

  renderPartnerWorkshops() {
    let contents;
    if (this.state.partnerWorkshops.length === 1) {
      contents = (
        <div>
          <h5>
            Your region’s assigned summer workshop will be
            {` ${this.state.partnerWorkshops[0].dates} in`}
            {` ${this.state.partnerWorkshops[0].location} `}
            hosted by {` ${this.state.regionalPartnerName}.`}
          </h5>

          {this.renderAbleToAttendSingle()}
        </div>
      );
    } else { // multiple workshops
      const options = this.state.partnerWorkshops.map(workshop =>
        `${workshop.dates} in ${workshop.location} hosted by ${this.state.regionalPartnerName}`
      );
      options.push(TextFields.noExplain);
      const textFieldMap = {[TextFields.noExplain]: 'explain'};
      contents = this.dynamicCheckBoxesWithAdditionalTextFieldsFor(
        "ableToAttendMultiple",
        options,
        textFieldMap
      );
    }

    return (
      <div>
        <h4>
          Your regional partner is {this.state.regionalPartnerName}
        </h4>
        {contents}
      </div>
    );
  }

  renderAlternateWorkshopList() {
    if (this.state.loadingAlternateWorkshops || this.state.alternateWorkshops === null) {
      return null;
    }

    const options = this.state.alternateWorkshops.map(workshop =>
      `${workshop.dates} in ${workshop.location} hosted by ${workshop.partnerName}`
    );

    return this.dynamicCheckBoxesFor("alternateWorkshops", options, {required: false});
  }

  render() {
    return (
      <FormGroup>
        <h3>Section
          4: {SectionHeaders.section4ProfessionalLearningProgramRequirements}</h3>

        <p>
          All participants in Code.org’s Professional Learning Program are required to
          attend a five-day
          in-person summer workshop. These workshops are either hosted locally by
          Code.org’s Regional Partners.
          Participants are assigned to workshops based on their Regional Partner.
          Meals (and in some cases travel costs) will be provided for summer workshops.
        </p>

        {this.renderContents()}
      </FormGroup>
    );
  }

  renderContents() {
    if (this.props.data.program === undefined) {
      return (
        <div styles={styles.error}>
          <p>
            Please fill out Section 2 and select your program before completing this
            section.
          </p>
        </div>
      );
    } else if (this.state.loadingPartner) {
      return <Spinner/>;
    } else if (this.state.loadError) {
      return (
        <div style={styles.error} id="partner-workshops-error">
          <p>
            An error has prevented us from loading your regional partner and workshop
            information.
          </p>
          <p>
            Refresh the page to try again. If this persists, please contact&nbsp;
            <a href="https://support.code.org/hc/en-us/requests/new">
              support
            </a>.
          </p>
        </div>
      );
    }

    return (
      <div>
        <div id="assignedWorkshops">
          {this.renderAssignedWorkshopList()}
        </div>

        {this.isUnableToAttendAssignedWorkshop() &&
        <div style={styles.indented}>
          <p style={styles.formText}>
            <strong>
              We strongly encourage participants to attend their assigned summer workshop
              (based on the region
              in which you currently teach), so that you can meet the other teachers,
              facilitators, and
              Regional Partners with whom you will work in 2019-20.
            </strong>
          </p>
          {this.renderAlternateWorkshopList()}
        </div>
        }
        <p>
          Teachers in this program are required to participate in both:
        </p>
        <ul>
          <li>
            One five-day, in-person summer workshop in 2019
          </li>
          <li>
            Up to four one-day, in-person local workshops during the 2019-20 school year
            (typically held on Saturdays)
          </li>
        </ul>
        {this.radioButtonsWithAdditionalTextFieldsFor('committed', {
          [TextFields.noExplain]: 'other'
        })}
        <div>
          <label>
            Your application has been assigned to a program hosted by one of our Regional
            Partners based on your geographic location. There may be a fee associated with
            the program in your region. There also may be scholarships available to help
            cover the cost of the program. You can check{' '}
            <a href="https://code.org/educate/regional-partner/summer-workshop-fee" target="_blank">
              this page to see if there are
            </a>
            {' '}fees and/or scholarships available in your region.
          </label>
          {this.radioButtonsFor("payFee")}
          {this.props.data.payFee === TextFields.noPayFee1920 && this.largeInputFor('scholarshipReasons')}
          {this.radioButtonsFor('willingToTravel')}
          We may offer online academic year workshops for those unable to travel to their local academic year workshops. Important notes.
          <ol>
            <li>
              The online option for academic year workshops is not guaranteed - we are
              piloting this option now, and considering the effectiveness of this method
              before rolling it out large-scale.
            </li>
            <li>
              An online option for the five-day summer workshop does not currently exist -
              all participants accepted to the Professional Learning Program will need to
              commit to attending the five-day summer workshop in-person.
            </li>
          </ol>
          {this.radioButtonsFor('interestedInOnlineProgram')}
        </div>
      </div>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.regionalPartnerWorkshopIds && data.regionalPartnerWorkshopIds.length === 1) {
      requiredFields.push("ableToAttendSingle");
    } else if (data.regionalPartnerWorkshopIds && data.regionalPartnerWorkshopIds.length > 1) {
      requiredFields.push("ableToAttendMultiple");
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (!data.regionalPartnerId) {
      changes.ableToAttendSingle = undefined;
      changes.ableToAttendMultiple = undefined;
    } else if (data.regionalPartnerWorkshopIds.length === 1) {
      changes.ableToAttendMultiple = undefined;
    } else {
      changes.ableToAttendSingle = undefined;
    }

    if (data.regionalPartnerGroup !== 1) {
      changes.understandFee = undefined;
      changes.payFee = undefined;
    }

    if (data.payFee !== TextFields.noPayFee) {
      changes.considerForFunding = undefined;
    }

    return changes;
  }
}
