import React from 'react';
import $ from "jquery";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import {styles as defaultStyles, PROGRAM_CSD, PROGRAM_CSP} from "./TeacherApplicationConstants";
import Spinner from '../../components/spinner';
import color from '@cdo/apps/util/color';

const WORKSHOP_FEES_URL = "https://docs.google.com/spreadsheets/d/1YFrTFp-Uz0jWk9-UR9JVuXfoDcCL6J0hxK5CYldv_Eo";

const styles = {
  ...defaultStyles,
  error: {
    color: color.red
  }
};

export default class Section4SummerWorkshop extends LabeledFormComponent {
  static labels = PageLabels.section4SummerWorkshop;

  static associatedFields = [
    ...Object.keys(PageLabels.section4SummerWorkshop),
    "regionalPartnerId",
    "regionalPartnerGroup",
    "regionalPartnerWorkshopIds",
    "teachercon"
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
        regionalPartnerWorkshopIds: (data.workshops || []).map(workshop => workshop.id),
        teachercon: data.teachercon
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
      [PROGRAM_CSD] : 'CS Discoveries',
      [PROGRAM_CSP] : 'CS Principles'
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
      "Yes, I'm able to attend",
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
            If a seat opens in the program, we will invite you to a TeacherCon and provide you with more details.
          </p>
        </div>
      );
    } else if (this.props.data.teachercon) {
      const teacherconSummary =
        `TeacherCon ${this.props.data.teachercon.city}, ${this.props.data.teachercon.dates}`;

      return (
        <div>
          <h5>
            You have been assigned to {teacherconSummary}.
            More details will be provided if you are accepted into the program.
          </h5>

          {this.renderAbleToAttendSingle()}
        </div>
      );
    } else /* partner groups 1-2, and group 3 partners with workshops */ {
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
        <h3>Section 4: {SectionHeaders.section4SummerWorkshop}</h3>

        <p>
          All participants in Code.org’s Professional Learning Program are required to attend a five-day
          in-person summer workshop. These workshops are either hosted locally by Code.org’s Regional Partners,
          or by Code.org at Code.org’s TeacherCons. Participants are assigned to workshops based on their
          Regional Partner. Flights, lodging, and meals will be provided for TeacherCon attendees; meals
          (and in some cases travel costs) will be provided for summer workshops hosted by Regional Partners.
        </p>

        {this.renderContents()}
      </FormGroup>
    );
  }

  renderContents() {
    if (this.state.loadingPartner) {
      return <Spinner />;
    } else if (this.state.loadError) {
      return (
        <div style={styles.error} id="partner-workshops-error">
          <p>
            An error has prevented us from loading your regional partner and workshop information.
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

        {this.isUnableToAttendAssignedWorkshop() && !this.props.data.teachercon &&
          <div style={styles.indented}>
            <p style={styles.formText}>
              <strong>
                We strongly encourage participants to attend their assigned summer workshop (based on the region
                in which you currently teach), so that you can meet the other teachers, facilitators, and
                Regional Partners with whom you will work in 2018-19.
              </strong>
            </p>

            {this.renderAlternateWorkshopList()}
          </div>
        }

        {this.props.data.regionalPartnerGroup === 1 &&
          <div>
            <label>
              There may be a fee associated with your summer workshop.
              Please carefully
              {' '}<a href={WORKSHOP_FEES_URL} target="_blank">check this list</a>{' '}
              to find more information about your workshop.
            </label>

            {this.singleCheckboxFor("understandFee")}
            {this.radioButtonsFor("payFee")}

            {this.props.data.payFee === TextFields.noPayFee &&
              this.singleCheckboxFor("considerForFunding", {
                required: false,
                style: styles.checkBoxAfterButtonList
              })
            }
          </div>
        }

        <br />
        <div style={styles.formText}>
          <strong>
            As a reminder, teachers in this program are required to participate in both:
            <ul>
              <li>
                One five-day, in-person summer workshop in 2018
              </li>
              <li>
                Up to four one-day, in-person local workshops during the 2018 - 19 school year (typically held on Saturdays)
              </li>
            </ul>
          </strong>
        </div>

        {this.radioButtonsWithAdditionalTextFieldsFor("committed", {
          [TextFields.noExplain] : 'explain'
        })}

        {this.radioButtonsFor("willingToTravel")}
      </div>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.teachercon) {
      requiredFields.push("ableToAttendSingle");
    } else if (data.regionalPartnerWorkshopIds && data.regionalPartnerWorkshopIds.length === 1) {
      requiredFields.push("ableToAttendSingle");
    } else if (data.regionalPartnerWorkshopIds && data.regionalPartnerWorkshopIds.length > 1) {
      requiredFields.push("ableToAttendMultiple");
    }

    if (data.regionalPartnerGroup === 1) {
      requiredFields.push(
        "understandFee",
        "payFee"
      );
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
    } else if (data.teachercon) {
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
