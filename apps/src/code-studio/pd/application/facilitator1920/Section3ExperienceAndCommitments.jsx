import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';
import {CSF, CSD, CSP} from '../ApplicationConstants';
import {ProgramMapping} from './Facilitator1920Application';

const PARTNERS_WITHOUT_CSF = [2, 3, 4, 44, 55, 80];
const PARTNER_WORKSHOPS_API_ENDPOINT = '/api/v1/pd/regional_partner_workshops/find?';

export default class Section3ExperienceAndCommitments extends LabeledFormComponent {
  static labels = PageLabels.section3ExperienceAndCommitments;

  static associatedFields = [
    ...Object.keys(PageLabels.section3ExperienceAndCommitments),
    "regionalPartnerId"
  ];

  state = {
    loadingFitWorkshops: true,
    loadingSummerWorkshops: false,
    partner: null,
    loadError: false
  };

  componentDidMount() {
    const program = ProgramMapping[this.props.data.program];

    this.loadFitWorkshops();

    if (program === CSD || program === CSP) {
      this.loadSummerWorkshops();
    }
  }

  componentWillUnmount() {
    if (this.loadFitWorkshopsRequest) {
      this.loadFitWorkshopsRequest.abort();
    }
    if (this.loadSummerWorkshopsRequest) {
      this.loadSummerWorkshopsRequest.abort();
    }
  }

  loadFitWorkshops() {
    const queryParams = {
      course: ProgramMapping[this.props.data.program],
      subject: 'Code.org Facilitator Weekend',
      zip_code: this.props.data.zipCode,
      state: this.props.data.state
    };

    const url = PARTNER_WORKSHOPS_API_ENDPOINT + $.param(queryParams);
    this.loadFitWorkshopsRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    }).done((data) => {
      this.loadFitWorkshopsRequest = null;

      this.handleChange({
        regionalPartnerId: data.id,
        fitWorkshops: data.workshops,
        regionalPartnerName: data.name
      });

      this.setState({
        loadingFitWorkshops: false
      });
    }).error(() => {
      this.setState({
        loadingFitWorkshops: false,
        loadError: true
      });
    });
  }

  loadSummerWorkshops() {
    this.setState({loadingSummerWorkshops: true});

    const queryParams = {
      course: ProgramMapping[this.props.data.program],
      subject: '5-day Summer',
      zip_code: this.props.data.zipCode,
      state: this.props.data.state
    };

    const url = PARTNER_WORKSHOPS_API_ENDPOINT + $.param(queryParams);
    this.loadSummerWorkshopsRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    }).done((data) => {
      this.loadSummerWorkshopsRequest = null;

      this.handleChange({
        regionalPartnerId: data.id,
        summerWorkshops: data.workshops,
        regionalPartnerName: data.name
      });

      this.setState({
        loadingSummerWorkshops: false
      });
    }).error(() => {
      this.setState({
        loadingSummerWorkshops: false,
        loadError: true
      });
    });
  }

  renderCsdCspWhichFitWeekend() {
    if (this.props.data.fitWorkshops && this.props.data.fitWorkshops.length > 0) {
      const options = this.props.data.fitWorkshops.map(workshop =>
        `${workshop.dates} in ${workshop.location}`
      );
      options.push(TextFields.notSurePleaseExplain, TextFields.unableToAttendPleaseExplain);

      const textFieldMap = {
        [TextFields.notSurePleaseExplain] : "other",
        [TextFields.unableToAttendPleaseExplain] : "other"
      };

      return this.dynamicCheckBoxesWithAdditionalTextFieldsFor(
        "csdCspWhichFitWeekend",
        options,
        textFieldMap
      );
    }
  }

  renderCsdCspWhichSummerWorkshop() {
    if (this.props.data.summerWorkshops && this.props.data.summerWorkshops.length > 0) {
      const options = this.props.data.summerWorkshops.map(workshop =>
        `${workshop.dates} in ${workshop.location}`
      );
      options.push(TextFields.notSurePleaseExplain, "I'm not able to attend any of the above");

      const textFieldMap = {
        [TextFields.notSurePleaseExplain] : "other"
      };

      return this.dynamicCheckBoxesWithAdditionalTextFieldsFor(
        "csdCspWhichSummerWorkshop",
        options,
        textFieldMap
      );
    }
  }

  render() {
    const program = ProgramMapping[this.props.data.program] || 'CS Program';
    return (
      <FormGroup>
        <h3>Section 3: {SectionHeaders.section3ExperienceAndCommitments}</h3>
        {this.radioButtonsFor("teachingExperience")}
        {this.radioButtonsFor("haveLedAdults")}

        <p>
          The Code.org Facilitator Development Program is an intensive, year-long
          commitment that kicks off your time as a Code.org facilitator. The high-level
          program commitments for the first year are listed below. Please indicate
          whether you can reasonably meet these commitments, and note that we expect
          that you would continue facilitating beyond this first year.
        </p>

        {
          program !== CSF &&
          <div>
            {
              !this.props.data.regionalPartnerId &&
              <div>
                <p>
                  <strong>There is no Regional Partner in your region at this time.</strong>
                </p>
                <p>
                  Please note that we prioritize applicants in regions where we currently have a Regional
                  Partner, and there is a need for additional facilitators. Code.org will review your
                  application and contact you if there is a need for facilitators in a nearby region. We are
                  not able to guarantee a space for you in a different location.
                </p>
                {this.checkBoxesFor('csdCspNoPartnerSummerWorkshop')}
              </div>
            }
            {
              this.props.data.regionalPartnerId &&
              <div>
                <p>
                  <strong>Your Regional Partner is {this.state.regionalPartnerName}.</strong>
                </p>
                {
                  !this.state.summerWorkshops &&
                  <div>
                    {this.checkBoxesFor('csdCspPartnerButNoSummerWorkshop')}
                  </div>
                }
                {
                  this.state.summerWorkshops &&
                  <div>
                    {this.radioButtonsFor('csdCspPartnerWithSummerWorkshop')}
                    {this.renderCsdCspWhichSummerWorkshop()}
                  </div>
                }
              </div>
            }

            {this.radioButtonsFor("csdCspFitWeekendRequirement")}
            {this.renderCsdCspWhichFitWeekend()}
            {this.radioButtonsFor("csdCspWorkshopRequirement")}

            {
              program === CSD &&
              <div>
                {this.radioButtonsFor("csdTrainingRequirement")}
              </div>
            }

            {
              program === CSP &&
              <div>
                {this.radioButtonsFor("cspTrainingRequirement")}
              </div>
            }

            {this.radioButtonsFor("csdCspLeadSummerWorkshopRequirement")}
            {this.radioButtonsFor("csdCspDeeperLearningRequirement")}
          </div>
        }

        {
          program === CSF &&
          <div>
            {this.radioButtonsFor("csfSummitRequirement")}
            {this.radioButtonsFor("csfWorkshopRequirement")}
            {this.radioButtonsFor("csfCommunityRequirement")}
          </div>
        }

        {this.radioButtonsFor("developmentAndPreparationRequirement")}

        {
          program === CSF &&
          <div>
            <p>
              Code.org facilitators work with their assigned Regional Partner to host workshops
              for teachers in their region. Facilitator applicants are assigned to Regional
              Partners based on the zip code they provide in their application.
            </p>

            {
              !this.props.data.regionalPartnerId &&
              <div>
                <p>
                  <strong>There is no Regional Partner supporting CS Fundamentals in your region at this time.</strong>
                </p>
                <p>
                  Please note that we prioritize applicants in regions where we currently have a
                  Regional Partner supporting CS Fundamentals, and there is a need for additional
                  facilitators. Code.org will review your application and contact you if there is
                  a need for facilitators. We are not able to guarantee a space for you in a
                  different location.
                </p>
              </div>
            }
            {
              this.props.data.regionalPartnerId && PARTNERS_WITHOUT_CSF.includes(this.props.data.regionalPartnerId) &&
              <div>
                <p>
                  <strong>Your Regional Partner is not accepting applications for CS Fundamentals facilitators at this time.</strong>
                </p>
                <p>
                  Please note that we prioritize applicants in regions where we currently have a
                  Regional Partner supporting CS Fundamentals, and there is a need for additional
                  facilitators. Code.org will review your application and contact you if there is
                  a need for facilitators. We are not able to guarantee a space for you in a
                  different location.
                </p>
              </div>
            }
            {
              this.props.data.regionalPartnerId && !PARTNERS_WITHOUT_CSF.includes(this.props.data.regionalPartnerId) &&
              <div>
                <p>
                  <strong>Your Regional Partner is {this.state.regionalPartnerName}.</strong>
                </p>
                {this.radioButtonsFor('csfGoodStandingRequirement')}
              </div>
            }
          </div>
        }
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];
    const program = ProgramMapping[data.program] || 'CS Program';

    if (program === CSF) {
      requiredFields.push(
        "csfSummitRequirement",
        "csfWorkshopRequirement",
        "csfCommunityRequirement"
      );

      if (data.regionalPartnerId && !PARTNERS_WITHOUT_CSF.includes(data.regionalPartnerId)) {
        requiredFields.push("csfGoodStandingRequirement");
      }
    }

    if (program !== CSF) {
      if (!data.regionalPartnerId) {
        requiredFields.push("csdCspNoPartnerSummerWorkshop");
      }
      if (data.regionalPartnerId) {
        if (data.summerWorkshops && data.summerWorkshops.length > 0) {
          requiredFields.push(
            "csdCspPartnerWithSummerWorkshop",
            "csdCspWhichSummerWorkshop"
          );
        } else {
          requiredFields.push("csdCspPartnerButNoSummerWorkshop");
        }
      }
      if (data.fitWorkshops && data.fitWorkshops.length > 0) {
        requiredFields.push("csdCspWhichFitWeekend");
      }
      requiredFields.push(
        "csdCspFitWeekendRequirement",
        "csdCspWorkshopRequirement",
        "csdCspSummerWorkshopRequirement",
        "csdCspDeeperLearningRequirement"
      );
    }

    if (program === CSD) {
      requiredFields.push("csdTrainingRequirement");
    }

    if (program === CSP) {
      requiredFields.push("cspTrainingRequirement");
    }

    return requiredFields;
  }
}
