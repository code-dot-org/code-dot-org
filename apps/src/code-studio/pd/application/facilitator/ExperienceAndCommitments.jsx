import React from 'react';
import {FormGroup} from 'react-bootstrap';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitatorApplicationConstants';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {CSF, CSD, CSP} from '../ApplicationConstants';

const PARTNER_WORKSHOPS_API_ENDPOINT =
  '/api/v1/pd/regional_partner_workshops/find?';

export default class ExperienceAndCommitments extends LabeledFormComponent {
  static labels = PageLabels.experienceAndCommitments;

  static associatedFields = [
    ...Object.keys(PageLabels.experienceAndCommitments),
    'regionalPartnerId'
  ];

  state = {
    loadingFitWorkshops: true,
    loadingSummerWorkshops: false,
    partner: null,
    loadError: false
  };

  componentDidMount() {
    this.loadFitWorkshops();

    if ([CSD, CSP].includes(this.props.data.program)) {
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
      course: this.props.data.program,
      subject: SubjectNames.SUBJECT_FIT,
      zip_code: this.props.data.zipCode,
      state: this.props.data.state
    };

    const url = PARTNER_WORKSHOPS_API_ENDPOINT + $.param(queryParams);
    this.loadFitWorkshopsRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
      .done(data => {
        this.loadFitWorkshopsRequest = null;

        this.handleChange({
          regionalPartnerId: data.id,
          fitWorkshops: data.workshops,
          regionalPartnerName: data.name
        });

        this.setState({
          loadingFitWorkshops: false
        });
      })
      .error(() => {
        this.setState({
          loadingFitWorkshops: false,
          loadError: true
        });
      });
  }

  loadSummerWorkshops() {
    this.setState({loadingSummerWorkshops: true});

    const queryParams = {
      course: this.props.data.program,
      subject: SubjectNames.SUBJECT_SUMMER_WORKSHOP,
      zip_code: this.props.data.zipCode,
      state: this.props.data.state
    };

    const url = PARTNER_WORKSHOPS_API_ENDPOINT + $.param(queryParams);
    this.loadSummerWorkshopsRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
      .done(data => {
        this.loadSummerWorkshopsRequest = null;

        this.handleChange({
          regionalPartnerId: data.id,
          summerWorkshops: data.workshops,
          regionalPartnerName: data.name
        });

        this.setState({
          loadingSummerWorkshops: false
        });
      })
      .error(() => {
        this.setState({
          loadingSummerWorkshops: false,
          loadError: true
        });
      });
  }

  renderCsdCspWhichFitWeekend() {
    if (
      this.props.data.fitWorkshops &&
      this.props.data.fitWorkshops.length > 0
    ) {
      const options = this.props.data.fitWorkshops.map(
        workshop => `${workshop.dates} in ${workshop.location}`
      );
      options.push(
        TextFields.notSurePleaseExplain,
        TextFields.unableToAttendPleaseExplain
      );

      const textFieldMap = {
        [TextFields.notSurePleaseExplain]: 'not_sure',
        [TextFields.unableToAttendPleaseExplain]: 'unable_to_attend'
      };

      return this.dynamicCheckBoxesWithAdditionalTextFieldsFor(
        'csdCspWhichFitWeekend',
        options,
        textFieldMap
      );
    }
  }

  renderCsdCspWhichSummerWorkshop() {
    if (
      this.props.data.summerWorkshops &&
      this.props.data.summerWorkshops.length > 0
    ) {
      const options = this.props.data.summerWorkshops.map(
        workshop => `${workshop.dates} in ${workshop.location}`
      );
      options.push(
        TextFields.notSurePleaseExplain,
        TextFields.unableToAttendPleaseExplain
      );

      const textFieldMap = {
        [TextFields.notSurePleaseExplain]: 'not_sure',
        [TextFields.unableToAttendPleaseExplain]: 'unable_to_attend'
      };

      return this.dynamicCheckBoxesWithAdditionalTextFieldsFor(
        'csdCspWhichSummerWorkshop',
        options,
        textFieldMap
      );
    }
  }

  render() {
    const program = this.props.data.program || 'CS Program';
    return (
      <FormGroup>
        <h3>Section 3: {SectionHeaders.experienceAndCommitments}</h3>
        {this.radioButtonsFor('teachingExperience')}
        {this.radioButtonsFor('haveLedAdults')}

        <p>
          The Code.org Facilitator Development Program is an intensive,
          year-long commitment that kicks off your time as a Code.org
          facilitator. The high-level program commitments for the first year are
          listed below. Please indicate whether you can reasonably meet these
          commitments, and note that we expect that you would continue
          facilitating beyond this first year.
        </p>

        {program !== CSF && (
          <div>
            {!this.props.data.regionalPartnerId && (
              <div>
                <p>
                  <strong>
                    There is no Regional Partner in your region at this time.
                  </strong>
                </p>
                <p>
                  Please note that we prioritize applicants in regions where we
                  currently have a Regional Partner, and there is a need for
                  additional facilitators. Code.org will review your application
                  and contact you if there is a need for facilitators in a
                  nearby region. We are not able to guarantee a space for you in
                  a different location.
                </p>
                {this.checkBoxesFor('csdCspNoPartnerSummerWorkshop')}
              </div>
            )}
            {this.props.data.regionalPartnerId && (
              <div>
                <p>
                  <strong>
                    Your Regional Partner is{' '}
                    {this.props.data.regionalPartnerName}.
                  </strong>
                </p>
                {this.props.data.summerWorkshops &&
                  this.props.data.summerWorkshops.length === 0 && (
                    <div>
                      {this.checkBoxesFor('csdCspPartnerButNoSummerWorkshop')}
                    </div>
                  )}
                {this.props.data.summerWorkshops &&
                  this.props.data.summerWorkshops.length > 0 && (
                    <div>
                      {this.radioButtonsFor('csdCspPartnerWithSummerWorkshop')}
                      {this.renderCsdCspWhichSummerWorkshop()}
                    </div>
                  )}
              </div>
            )}

            {this.radioButtonsFor('csdCspFitWeekendRequirement')}
            {this.renderCsdCspWhichFitWeekend()}
            {this.radioButtonsFor('csdCspWorkshopRequirement')}

            {program === CSD && (
              <div>{this.radioButtonsFor('csdTrainingRequirement')}</div>
            )}

            {program === CSP && (
              <div>{this.radioButtonsFor('cspTrainingRequirement')}</div>
            )}

            {this.radioButtonsFor('csdCspLeadSummerWorkshopRequirement')}
            {this.radioButtonsFor('csdCspDeeperLearningRequirement')}
          </div>
        )}

        {program === CSF && (
          <div>
            {this.radioButtonsFor('csfSummitRequirement')}
            {this.radioButtonsFor('csfWorkshopRequirement')}
            {this.radioButtonsFor('csfCommunityRequirement')}
          </div>
        )}

        {this.radioButtonsFor('developmentAndPreparationRequirement')}

        {program !== CSF &&
          this.radioButtonsFor('csdCspGoodStandingRequirement')}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];
    const program = data.program || 'CS Program';

    if (program === CSF) {
      requiredFields.push(
        'csfSummitRequirement',
        'csfWorkshopRequirement',
        'csfCommunityRequirement'
      );
    }

    if (program !== CSF) {
      if (!data.regionalPartnerId) {
        requiredFields.push('csdCspNoPartnerSummerWorkshop');
      } else {
        if (data.summerWorkshops && data.summerWorkshops.length > 0) {
          requiredFields.push(
            'csdCspPartnerWithSummerWorkshop',
            'csdCspWhichSummerWorkshop'
          );
        } else {
          requiredFields.push('csdCspPartnerButNoSummerWorkshop');
        }
      }
      if (data.fitWorkshops && data.fitWorkshops.length > 0) {
        requiredFields.push('csdCspWhichFitWeekend');
      }
      requiredFields.push(
        'csdCspFitWeekendRequirement',
        'csdCspWorkshopRequirement',
        'csdCspLeadSummerWorkshopRequirement',
        'csdCspDeeperLearningRequirement',
        'csdCspGoodStandingRequirement'
      );
    }

    if (program === CSD) {
      requiredFields.push('csdTrainingRequirement');
    }

    if (program === CSP) {
      requiredFields.push('cspTrainingRequirement');
    }

    return requiredFields;
  }
}
