import React from 'react';
import PropTypes from 'prop-types';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import {styles as defaultStyles} from './TeacherApplicationConstants';
import Spinner from '../../components/spinner';
import color from '@cdo/apps/util/color';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {LabeledLargeInput} from '../../form_components_func/labeled/LabeledInput';
import {LabeledSingleCheckbox} from '../../form_components_func/labeled/LabeledSingleCheckbox';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields
} from '../../form_components_func/labeled/LabeledRadioButtons';
import {LabeledDynamicCheckBoxesWithAdditionalTextFields} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {useRegionalPartner} from '../../components/useRegionalPartner';
import {FormContext} from '../../form_components_func/FormComponent';

const ProfessionalLearningProgramRequirements = props => {
  const {data} = props;
  const [regionalPartner, regionalPartnerError] = useRegionalPartner(data);

  const renderAssignedWorkshopList = () => {
    if (regionalPartner.workshops?.length === 0) {
      return (
        <p style={styles.marginBottom}>
          <strong>
            Summer Workshop dates have not yet been finalized for your region.{' '}
            {regionalPartner.name} will be in touch once workshop details are
            known.
          </strong>
        </p>
      );
    } else {
      const options = regionalPartner.workshops.map(
        workshop => `${workshop.dates} (${workshop.location})`
      );
      options.push(TextFields.notSureExplain);
      options.push(TextFields.unableToAttend);
      const textFieldMap = {
        [TextFields.notSureExplain]: 'notSureExplain',
        [TextFields.unableToAttend]: 'unableToAttend'
      };

      return (
        <div>
          <LabeledDynamicCheckBoxesWithAdditionalTextFields
            name="ableToAttendMultiple"
            label={PageLabels.professionalLearningProgramRequirements.ableToAttendMultiple.replace(
              'Your Regional Partner',
              regionalPartner.name
            )}
            options={options}
            textFieldMap={textFieldMap}
          />
        </div>
      );
    }
  };

  const renderContents = () => {
    if (data.program === undefined) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 2 and select your program before completing
            this section.
          </p>
        </div>
      );
    } else if (!data.school) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 1 and select your school before completing
            this section.
          </p>
        </div>
      );
    } else if (regionalPartner === undefined) {
      return <Spinner />;
    } else if (regionalPartnerError) {
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
    } else if (regionalPartner === null) {
      return (
        <>
          <p>
            <strong>
              There is no Regional Partner in your region at this time
            </strong>
          </p>
          <p>
            Code.org will review your application and contact you with options
            for joining the program hosted by a Regional Partner from a
            different region. Please note that we are not able to guarantee a
            space for you with another Regional Partner, and you will be
            responsible for the costs associated with traveling to that location
            if a virtual option is not available.
          </p>
        </>
      );
    } else {
      // regional partner exists and is not errored
      return (
        <div>
          <p>
            Code.org’s Professional Learning Program is a yearlong program
            starting in the summer and concluding in the spring. Workshops can
            be held in-person, virtually, or as a combination of both throughout
            the year. Refer to {`${regionalPartner.name}'s `}
            <a
              href={
                pegasus('/educate/professional-learning/program-information') +
                (!!data.schoolZipCode ? '?zip=' + data.schoolZipCode : '')
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              landing page
            </a>{' '}
            for more information about the schedule and delivery model.
          </p>
          <LabeledRadioButtonsWithAdditionalTextFields
            name="committed"
            textFieldMap={{
              [TextFields.noExplain]: 'other'
            }}
          />
          {renderAssignedWorkshopList()}
          <div>
            <label>
              {regionalPartner.name} may have scholarships available to cover
              the cost of the program.{' '}
              <a
                href={
                  pegasus(
                    '/educate/professional-learning/program-information'
                  ) + (!!data.schoolZipCode ? '?zip=' + data.schoolZipCode : '')
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Click here to check the fees and discounts for your program
              </a>
              . Let us know if your school or district would be able to pay the
              fee or if you need to be considered for a scholarship.
            </label>
            <LabeledSingleCheckbox name="understandFee" />
            <LabeledRadioButtons name="payFee" />
            {data.payFee === TextFields.noPayFee && (
              <LabeledLargeInput name="scholarshipReasons" />
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider
        value={PageLabels.professionalLearningProgramRequirements}
      >
        <FormGroup>
          <h3>
            Section 3: {SectionHeaders.professionalLearningProgramRequirements}
          </h3>

          {renderContents()}
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};

ProfessionalLearningProgramRequirements.getDynamicallyRequiredFields = data => {
  const requiredFields = [];

  if (
    data.regionalPartnerWorkshopIds &&
    data.regionalPartnerWorkshopIds.length > 0
  ) {
    requiredFields.push('ableToAttendMultiple', 'committed');
  }

  if (data.regionalPartnerId) {
    requiredFields.push('payFee', 'understandFee');
  }

  if (data.regionalPartnerId && data.payFee === TextFields.noPayFee) {
    requiredFields.push('scholarshipReasons');
  }

  return requiredFields;
};

/**
 * @override
 */
ProfessionalLearningProgramRequirements.processPageData = data => {
  const changes = {};

  if (data.payFee !== TextFields.noPayFee) {
    changes.scholarshipReasons = undefined;
  }

  return changes;
};
ProfessionalLearningProgramRequirements.associatedFields = [
  ...Object.keys(PageLabels.professionalLearningProgramRequirements),
  'regionalPartnerId',
  'regionalPartnerGroup',
  'regionalPartnerWorkshopIds'
];
ProfessionalLearningProgramRequirements.propTypes = {
  options: PropTypes.object.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  errorMessages: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ProfessionalLearningProgramRequirements;

const styles = {
  ...defaultStyles,
  error: {
    color: color.red
  },
  marginBottom: {
    marginBottom: 30
  }
};
