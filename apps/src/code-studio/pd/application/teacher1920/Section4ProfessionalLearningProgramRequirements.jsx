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
    loadError: false
  };

  componentDidMount() {
    this.loadPartnerRequest = null;

    this.loadPartnerWorkshops();
  }

  componentWillUnmount() {
    if (this.loadPartnerRequest) {
      this.loadPartnerRequest.abort();
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

  renderAssignedWorkshopList() {
    if (!this.props.data.regionalPartnerId) {
      return (
        <p>
          There is no Regional Partner in your region at this time. Code.org will review
          your application and either assign your application to the nearest Regional
          Partner or reach out with options for you.
        </p>
      );
    } else {
      if (this.state.partnerWorkshops.length === 0) {
        return (
          <p>
            Local summer workshop dates have not yet been finalized for your region. Your
            Regional Partner will be in touch once workshop dates and locations are known.
          </p>
        );
      } else {
        return this.renderPartnerWorkshops();
      }
    }
  }

  renderPartnerWorkshops() {
    let contents;

    const options = this.state.partnerWorkshops.map(workshop =>
      `${workshop.dates} in ${workshop.location} hosted by ${this.state.regionalPartnerName}`
    );
    options.push(TextFields.notSureExplain);
    options.push(TextFields.unableToAttend);
    const textFieldMap = {[TextFields.notSureExplain]: 'notSureExplain'};
    contents = this.dynamicCheckBoxesWithAdditionalTextFieldsFor(
      "ableToAttendMultiple",
      options,
      textFieldMap
    );

    return (
      <div>
        {contents}
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
      </div>
    );
  }

  render() {
    return (
      <FormGroup>
        <h3>Section
          4: {SectionHeaders.section4ProfessionalLearningProgramRequirements}</h3>

        <p>
          All participants in Code.org’s Professional Learning Program are required to
          attend a five-day in-person summer workshop. These workshops are hosted locally
          by Code.org’s Regional Partners. Participants are assigned to workshops based on
          their Regional Partner. Meals (and in some cases travel costs) will be provided
          for summer workshops.
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
        <div>
          <label>
            Your application has been assigned to a program hosted by one of our Regional
            Partners based on your geographic location. There may be a fee associated with
            the program in your region. There also may be scholarships available to help
            cover the cost of the program. You can check{' '}
            <a
              href="https://code.org/educate/regional-partner/summer-workshop-fee"
              target="_blank"
            >
              this page to see if there are
            </a>
            {' '}fees and/or scholarships available in your region.
          </label>
          {this.radioButtonsFor("payFee")}
          {this.props.data.payFee === TextFields.noPayFee1920 && this.largeInputFor('scholarshipReasons')}
          {this.radioButtonsFor('willingToTravel')}
          We may offer online academic year workshops for those unable to travel to their
          local academic year workshops. Important notes:
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

    if (data.regionalPartnerWorkshopIds && data.regionalPartnerWorkshopIds.length > 0) {
      requiredFields.push(
        'ableToAttendMultiple',
        'committed'
      );
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};


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
