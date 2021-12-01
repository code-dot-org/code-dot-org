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
  const hasNoProgramSelected = data.program === undefined;
  const hasNoSchoolInformation = !data.school;
  const hasNotLoadedRegionalPartner = regionalPartner === undefined;
  const hasRegionalPartner =
    !hasNotLoadedRegionalPartner && regionalPartner !== null;

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

  const renderCostNote = () => {
    if (hasRegionalPartner) {
      return (
        <label>
          {regionalPartner.name} may have scholarships available to cover the
          cost of the program.{' '}
          <a
            href={
              pegasus('/educate/professional-learning/program-information') +
              (!!data.schoolZipCode ? '?zip=' + data.schoolZipCode : '')
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here to check the fees and discounts for your program
          </a>
          . Let us know if your school or district would be able to pay the fee
          or if you need to be considered for a scholarship.
        </label>
      );
    } else {
      return (
        <label>
          When you are matched with a partner, they may have scholarships
          available to cover the cost of the program. Let us know if your school
          or district would be able to pay the fee or if you need to be
          considered for a scholarship.
        </label>
      );
    }
  };

  const renderProgramRequirements = () => {
    return (
      <div>
        <p>
          Code.org’s Professional Learning Program is a yearlong program
          starting in the summer and concluding in the spring. Workshops can be
          held in-person, virtually, or as a combination of both throughout the
          year.
          {hasRegionalPartner && (
            <span>
              {' '}
              Refer to {`${regionalPartner.name}'s `}
              <a
                href={
                  pegasus(
                    '/educate/professional-learning/program-information'
                  ) + (!!data.schoolZipCode ? '?zip=' + data.schoolZipCode : '')
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                landing page
              </a>{' '}
              for more information about the schedule and delivery model.
            </span>
          )}
        </p>
        <LabeledRadioButtonsWithAdditionalTextFields
          name="committed"
          textFieldMap={{
            [TextFields.noExplain]: 'other'
          }}
        />
        {hasRegionalPartner ? (
          renderAssignedWorkshopList()
        ) : (
          <p style={styles.marginBottom}>
            <strong>
              Once you have been matched with a partner, they will be in touch
              regarding Summer Workshop dates.
            </strong>
          </p>
        )}
        <div>
          {renderCostNote(hasRegionalPartner)}
          <LabeledSingleCheckbox name="understandFee" />
          <LabeledRadioButtons name="payFee" />
          {data.payFee === TextFields.noPayFee && (
            <LabeledLargeInput name="scholarshipReasons" />
          )}
        </div>
      </div>
    );
  };

  const renderContents = () => {
    if (hasNoProgramSelected) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 2 and select your program before completing
            this section.
          </p>
        </div>
      );
    } else if (hasNoSchoolInformation) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 1 and select your school before completing
            this section.
          </p>
        </div>
      );
    } else if (hasNotLoadedRegionalPartner) {
      return <Spinner />;
    } else if (regionalPartnerError) {
      return (
        <div style={styles.error} id="partner-workshops-error">
          <p>
            An error has prevented us from loading your regional partner and
            workshop information.
          </p>
          <p>
            Refresh the page to try again. If this persists, please contact{' '}
            <a href="https://support.code.org/hc/en-us/requests/new">support</a>
            .
          </p>
        </div>
      );
    } else {
      return renderProgramRequirements();
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
