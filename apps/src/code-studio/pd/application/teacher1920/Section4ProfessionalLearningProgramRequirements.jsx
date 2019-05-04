import React from 'react';
import $ from 'jquery';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
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
} from './TeacherApplicationConstants';
import Spinner from '../../components/spinner';
import color from '@cdo/apps/util/color';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import _ from 'lodash';

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
    'regionalPartnerId',
    'regionalPartnerGroup',
    'regionalPartnerWorkshopIds'
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
    } else if (this.props.data.school) {
      locationParams.school = this.props.data.school;
    } else {
      this.setState({
        loadingPartner: false,
        loadError: true
      });
      return;
    }

    const url = `/api/v1/pd/regional_partner_workshops/find?${$.param(
      locationParams
    )}`;
    this.loadPartnerRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
      .done(data => {
        this.loadPartnerRequest = null;

        this.handleChange({
          regionalPartnerId: data.id,
          regionalPartnerGroup: data.group,
          regionalPartnerWorkshopIds: (data.workshops || []).map(
            workshop => workshop.id
          )
        });

        // Update state with all the partner workshop data to display
        this.setState({
          loadingPartner: false,
          partnerWorkshops: data.workshops,
          regionalPartnerName: data.name
        });
      })
      .error(() => {
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

  renderRegionalPartnerName() {
    if (!this.state.regionalPartnerName) {
      return (
        <div>
          <p>
            <strong>
              There is no Regional Partner in your region at this time
            </strong>
          </p>
          <p>
            Code.org will review your application and contact you with options
            for joining another Regional Partner program. Please note that we
            are not able to guarantee a space for you in a different location,
            and you will be responsible for the costs related to traveling to
            that location.
          </p>
        </div>
      );
    } else {
      return (
        <p>
          <strong>
            Your Regional Partner is: {this.state.regionalPartnerName}
          </strong>
        </p>
      );
    }
  }

  renderAssignedWorkshopList() {
    if (this.state.partnerWorkshops.length === 0) {
      return (
        <p>
          <strong>
            Local summer workshop dates have not yet been finalized for your
            region. Your Regional Partner will be in touch once workshop dates
            and locations are known.
          </strong>
        </p>
      );
    } else {
      const options = this.state.partnerWorkshops.map(
        workshop => `${workshop.dates} in ${workshop.location}`
      );
      options.push(TextFields.notSureExplain);
      options.push(TextFields.unableToAttend1920);
      const textFieldMap = {
        [TextFields.notSureExplain]: 'notSureExplain',
        [TextFields.unableToAttend1920]: 'unableToAttend'
      };

      return (
        <div>
          {this.dynamicCheckBoxesWithAdditionalTextFieldsFor(
            'ableToAttendMultiple',
            options,
            textFieldMap
          )}
          {_.intersection(
            [TextFields.notSureExplain, TextFields.unableToAttend1920],
            this.props.data.ableToAttendMultiple
          ).length > 0 && (
            <div>
              {this.radioButtonsWithAdditionalTextFieldsFor(
                'travelToAnotherWorkshop',
                {[TextFields.notSureExplain]: 'notSure'},
                {
                  label: (
                    <span>
                      <strong>
                        If you are unable to make any of the above workshop
                        dates, would you be open to traveling to another region
                        for your local summer workshop?
                      </strong>
                      <br />
                      Note: This option may have other fees or costs associated
                      with it. Additionally, please note that we are not able to
                      guarantee a space for you in a different location, and you
                      will be responsible for the costs related to traveling to
                      that location. If you indicate yes, your Regional Partner
                      will follow up with more information.
                    </span>
                  )
                }
              )}
            </div>
          )}
        </div>
      );
    }
  }

  renderContents() {
    let showPayFeeNote = false;
    if (
      this.props.data.planToTeach &&
      !this.props.data.planToTeach.includes(
        'Yes, I plan to teach this course this year (2019-20)'
      ) &&
      this.props.data.payFee &&
      this.props.data.payFee.includes('No, ')
    ) {
      showPayFeeNote = true;
    }

    if (this.props.data.program === undefined) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 3 and select your program before completing
            this section.
          </p>
        </div>
      );
    } else if (!this.props.data.school) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 2 and select your school before completing
            this section.
          </p>
        </div>
      );
    } else if (this.state.loadingPartner) {
      return <Spinner />;
    } else if (this.state.loadError) {
      return (
        <div style={styles.error} id="partner-workshops-error">
          <p>
            An error has prevented us from loading your regional partner and
            workshop information.
          </p>
          <p>
            Refresh the page to try again. If this persists, please
            contact&nbsp;
            <a href="https://support.code.org/hc/en-us/requests/new">support</a>
            .
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <div id="regionalPartnerName">{this.renderRegionalPartnerName()}</div>
          <p>Teachers in this program are required to participate in both:</p>
          <ul>
            <li>One five-day, in-person summer workshop in 2019</li>
            <li>
              Up to four one-day, in-person local workshops during the 2019-20
              school year (typically held on Saturdays)
            </li>
          </ul>
          {this.radioButtonsWithAdditionalTextFieldsFor('committed', {
            [TextFields.noExplain]: 'other'
          })}
          <div id="assignedWorkshops">
            {this.props.data.regionalPartnerId &&
              this.renderAssignedWorkshopList()}
          </div>
          {this.radioButtonsFor('willingToTravel')}
          We may offer online academic year workshops for those unable to travel
          to their local academic year workshops. Important notes:
          <ol>
            <li>
              The online option for academic year workshops is not guaranteed -
              we are piloting this option now, and considering the effectiveness
              of this method before rolling it out large-scale.
            </li>
            <li>
              An online option for the five-day summer workshop does not
              currently exist - all participants accepted to the Professional
              Learning Program will need to commit to attending the five-day
              summer workshop in-person.
            </li>
          </ol>
          {this.radioButtonsFor('interestedInOnlineProgram')}
          {this.props.data.regionalPartnerId && (
            <div>
              <label>
                There may be scholarships available in your region to cover the
                cost of the program.{' '}
                <a
                  href={
                    pegasus(
                      '/educate/professional-learning/program-information'
                    ) +
                    (!!this.props.data.schoolZipCode
                      ? '?zip=' + this.props.data.schoolZipCode
                      : '')
                  }
                  target="_blank"
                >
                  Click here to check the fees and discounts for your program
                </a>
                . Let us know if your school would be able to pay the fee or if
                you need to be considered for a scholarship.
              </label>
              {this.radioButtonsFor('payFee')}
              {showPayFeeNote && (
                <p style={{color: 'red'}}>
                  Note: To be eligible for scholarship support, you must plan to
                  teach this course in the upcoming school year (2019-20). We
                  suggest checking with your administrators to ensure that the
                  course will be offered in 2019-20 before updating your answer
                  to "
                  <strong>
                    Do you plan to personally teach this course in the 2019-20
                    school year?
                  </strong>
                  " on page 3 and submitting your application.
                </p>
              )}
              {this.props.data.payFee === TextFields.noPayFee1920 &&
                this.largeInputFor('scholarshipReasons')}
            </div>
          )}
        </div>
      );
    }
  }

  render() {
    return (
      <FormGroup>
        <h3>
          Section 4:{' '}
          {SectionHeaders.section4ProfessionalLearningProgramRequirements}
        </h3>

        <p>
          Participants are assigned to a program hosted by one of our Regional
          Partners based on their school's geographic location.
        </p>

        {this.renderContents()}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (
      data.regionalPartnerWorkshopIds &&
      data.regionalPartnerWorkshopIds.length > 0
    ) {
      requiredFields.push('ableToAttendMultiple', 'committed');
    }

    if (data.regionalPartnerId) {
      requiredFields.push('payFee');
    }

    if (data.payFee === TextFields.noPayFee1920) {
      requiredFields.push('scholarshipReasons');
    }

    if (
      _.intersection(
        [TextFields.notSureExplain, TextFields.unableToAttend1920],
        data.ableToAttendMultiple
      ).length > 0
    ) {
      requiredFields.push('travelToAnotherWorkshop');
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.payFee !== TextFields.noPayFee1920) {
      changes.scholarshipReasons = undefined;
    }

    if (
      _.intersection(
        [TextFields.notSureExplain, TextFields.unableToAttend1920],
        data.ableToAttendMultiple
      ).length === 0
    ) {
      changes.travelToAnotherWorkshop = undefined;
    }

    return changes;
  }
}
