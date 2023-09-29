import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
  PageLabels,
  SectionHeaders,
  TextFields,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {
  PROGRAM_CSD,
  PROGRAM_CSP,
  PROGRAM_CSA,
  styles as defaultStyles,
} from './TeacherApplicationConstants';
import PrivacyDialog from '../PrivacyDialog';
import {PrivacyDialogMode} from '../../constants';
import Spinner from '../../components/spinner';
import color from '@cdo/apps/util/color';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {LabeledLargeInput} from '../../form_components_func/labeled/LabeledInput';
import {LabeledSingleCheckbox} from '../../form_components_func/labeled/LabeledSingleCheckbox';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields,
} from '../../form_components_func/labeled/LabeledRadioButtons';
import {LabeledDynamicCheckBoxesWithAdditionalTextFields} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {useRegionalPartner} from '../../components/useRegionalPartner';
import {FormContext} from '../../form_components_func/FormComponent';

const getProgramName = program => {
  switch (program) {
    case PROGRAM_CSD:
      return 'CS Discoveries';
    case PROGRAM_CSP:
      return 'CS Principles';
    case PROGRAM_CSA:
      return 'CSA';
    default:
      return 'CS Program';
  }
};

const ProfessionalLearningProgramRequirements = props => {
  const {data} = props;
  const [regionalPartner, regionalPartnerError] = useRegionalPartner(data);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
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
            Workshop dates have not yet been finalized for your region.{' '}
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
        [TextFields.unableToAttend]: 'unableToAttend',
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
          {regionalPartner.name} may have scholarships available to cover some
          or all costs associated with the program.{' '}
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
          available to cover some or all costs associated with the program. Let
          us know if your school or district would be able to pay the fee or if
          you need to be considered for a scholarship.
        </label>
      );
    }
  };

  const openPrivacyDialog = event => {
    // preventDefault so clicking this link inside the label doesn't
    // also check the checkbox.
    event.preventDefault();
    setIsPrivacyDialogOpen(true);
  };

  const handleClosePrivacyDialog = () => {
    setIsPrivacyDialogOpen(false);
  };

  const renderContents = () => {
    if (hasNoProgramSelected) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 1 and select your program before completing
            this section.
          </p>
        </div>
      );
    } else if (hasNoSchoolInformation) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 2 and select your school before completing
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

  const renderProgramRequirements = () => {
    const programConclusion =
      data.program === PROGRAM_CSA
        ? 'The program concludes the following summer with a Capstone experience that ' +
          'serves as an opportunity to prepare for the coming year and further connects ' +
          'you with the CS Education Community.'
        : 'The program will conclude in the spring.';
    return (
      <div>
        <p>
          Code.org’s Professional Learning Program for{' '}
          {getProgramName(data.program)} is a yearlong program, meant to support
          you throughout your first year teaching the course. Starting in the
          summer, the program begins with a week-long workshop to prepare you to
          start the year. During the school year, Academic Year Workshops will
          reinforce your skills and provide a community to discuss questions you
          have during the year. {programConclusion} Workshops will either be
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
              for more information about the schedule and delivery model in your
              region.
            </span>
          )}
        </p>

        <LabeledRadioButtonsWithAdditionalTextFields
          name="committed"
          textFieldMap={{
            [TextFields.noExplain]: 'other',
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

        <label className="control-label">Submit your application</label>
        <LabeledSingleCheckbox
          name="agree"
          label={
            <span>
              {PageLabels.professionalLearningProgramRequirements.agree.replace(
                'my local Code.org Regional Partner',
                regionalPartner
                  ? regionalPartner.name
                  : 'my local Code.org Regional Partner'
              )}{' '}
              <a onClick={openPrivacyDialog}>Learn more.</a>
            </span>
          }
        />
        <PrivacyDialog
          show={isPrivacyDialogOpen}
          onHide={handleClosePrivacyDialog}
          mode={PrivacyDialogMode.TEACHER_APPLICATION}
        />
      </div>
    );
  };

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider
        value={PageLabels.professionalLearningProgramRequirements}
      >
        <FormGroup>
          <h3>
            Section 7: {SectionHeaders.professionalLearningProgramRequirements}
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
  'regionalPartnerWorkshopIds',
];

ProfessionalLearningProgramRequirements.propTypes = {
  options: PropTypes.object.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  errorMessages: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ProfessionalLearningProgramRequirements;

const styles = {
  ...defaultStyles,
  error: {
    color: color.red,
  },
  marginBottom: {
    marginBottom: 30,
  },
};
