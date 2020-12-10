import React from 'react';
import {FormGroup} from 'react-bootstrap';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitatorApplicationConstants';
import {YES, CSF, CSD, CSP} from '../ApplicationConstants';

export default class ChooseYourProgram extends LabeledFormComponent {
  static labels = PageLabels.chooseYourProgram;

  static associatedFields = [...Object.keys(PageLabels.chooseYourProgram)];

  componentWillUnmount() {
    if (this.loadPartnerRequest) {
      this.loadPartnerRequest.abort();
    }
  }

  onProgramSelect(selected) {
    const program = selected.program;
    this.handleChange({program});

    if (program === CSF) {
      this.setState({
        loadingPartner: true,
        partner: null,
        loadError: false
      });
      this.loadPartnerRequest = null;

      this.loadPartner();
    }
  }

  loadPartner() {
    const params = {
      zip_code: this.props.data.zipCode,
      state: this.props.data.state
    };

    function onDone(data) {
      this.loadPartnerRequest = null;

      this.handleChange({
        regionalPartnerId: data.id,
        regionalPartnerName: data.name
      });

      this.setState({
        loadingPartner: false,
        hasCsf: data.has_csf
      });
    }

    function onError() {
      this.setState({
        loadingPartner: false,
        loadError: true
      });
    }

    const boundDone = onDone.bind(this);
    const boundError = onError.bind(this);
    const url = `/api/v1/pd/regional_partner_workshops/find?${$.param(params)}`;
    this.loadPartnerRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
      .done(data => {
        boundDone(data);
      })
      .error(() => {
        boundError();
      });
  }

  render() {
    return (
      <FormGroup>
        <h3>Section 2: {SectionHeaders.chooseYourProgram}</h3>
        <p>
          We offer our Facilitator Development Program for three Code.org
          courses. For more details about the requirements to facilitate each
          program, please visit the{' '}
          <a
            href="https://code.org/files/facilitator/overview-2019-20.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            2019-20 Facilitator Development Program Description
          </a>
          .
        </p>

        {this.buildButtons({
          name: 'program',
          label: ChooseYourProgram.labels['program'],
          type: 'radio',
          required: true,
          answers: [
            {
              answerText: 'CS Fundamentals (K - 5th grade)',
              answerValue: CSF
            },
            {
              answerText: 'CS Discoveries (6 - 10th grade)',
              answerValue: CSD
            },
            {
              answerText: 'CS Principles (9 - 12th grade)',
              answerValue: CSP
            }
          ],
          controlWidth: {md: 6},
          onChange: this.onProgramSelect.bind(this)
        })}

        {this.props.data.program === CSF && (
          <div>
            <p>
              Code.org facilitators work with their assigned Regional Partner to
              host workshops for teachers in their region. Facilitator
              applicants are assigned to Regional Partners based on the zip code
              they provide in their application.
            </p>

            {!this.props.data.regionalPartnerId && (
              <div>
                <p>
                  <strong>
                    There is no Regional Partner supporting CS Fundamentals in
                    your region at this time.
                  </strong>
                </p>
                <p>
                  Please note that we prioritize applicants in regions where we
                  currently have a Regional Partner supporting CS Fundamentals,
                  and there is a need for additional facilitators. Code.org will
                  review your application and contact you if there is a need for
                  facilitators. We are not able to guarantee a space for you in
                  a different location.
                </p>
              </div>
            )}
            {this.props.data.regionalPartnerId && !this.state.hasCsf && (
              <div>
                <p>
                  <strong>
                    Your Regional Partner is not accepting applications for CS
                    Fundamentals facilitators at this time.
                  </strong>
                </p>
                <p>
                  Please note that we prioritize applicants in regions where we
                  currently have a Regional Partner supporting CS Fundamentals,
                  and there is a need for additional facilitators. Code.org will
                  review your application and contact you if there is a need for
                  facilitators. We are not able to guarantee a space for you in
                  a different location.
                </p>
              </div>
            )}
            {this.props.data.regionalPartnerId && this.state.hasCsf && (
              <div>
                <p>
                  <strong>
                    Your Regional Partner is{' '}
                    {this.props.data.regionalPartnerName}.
                  </strong>
                </p>
              </div>
            )}
            {this.radioButtonsFor('csfGoodStandingRequirement')}
          </div>
        )}
        {this.radioButtonsFor('codeOrgFacilitator')}

        {this.props.data.codeOrgFacilitator === YES && (
          <div>
            {this.checkBoxesWithAdditionalTextFieldsFor(
              'codeOrgFacilitatorYears',
              {
                [TextFields.otherWithText]: 'other'
              }
            )}
            {this.checkBoxesWithAdditionalTextFieldsFor(
              'codeOrgFacilitatorPrograms',
              {
                [TextFields.otherWithText]: 'other'
              }
            )}
          </div>
        )}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.codeOrgFacilitator === YES) {
      requiredFields.push(
        'codeOrgFacilitatorYears',
        'codeOrgFacilitatorPrograms'
      );
    }

    if (data.program === CSF) {
      requiredFields.push('csfGoodStandingRequirement');
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.codeOrgFacilitator !== YES) {
      changes.codeOrgFacilitatorYears = undefined;
      changes.codeOrgFacilitatorPrograms = undefined;
    }

    return changes;
  }
}
