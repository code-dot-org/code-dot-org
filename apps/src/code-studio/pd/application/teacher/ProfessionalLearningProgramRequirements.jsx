import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {
  PageLabels,
  SectionHeaders,
  TextFields,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from '@cdo/apps/util/color';

import Spinner from '../../components/spinner';
import {useRegionalPartner} from '../../components/useRegionalPartner';
import {PrivacyDialogMode} from '../../constants';
import {FormContext} from '../../form_components_func/FormComponent';
import {LabeledDynamicCheckBoxesWithAdditionalTextFields} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {LabeledLargeInput} from '../../form_components_func/labeled/LabeledInput';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields,
} from '../../form_components_func/labeled/LabeledRadioButtons';
import {LabeledSingleCheckbox} from '../../form_components_func/labeled/LabeledSingleCheckbox';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import PrivacyDialog from '../PrivacyDialog';

import {
  PROGRAM_CSD,
  PROGRAM_CSP,
  PROGRAM_CSA,
  styles as defaultStyles,
} from './TeacherApplicationConstants';

const getProgramName = program => {
  switch (program) {
    case PROGRAM_CSD:
      return 'Computer Science Discoveries';
    case PROGRAM_CSP:
      return 'Computer Science Principles';
    case PROGRAM_CSA:
      return 'Computer Science A';
    default:
      return 'Computer Science Program';
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
    return (
      <div>
        <p>
          Code.org’s Professional Learning Program for{' '}
          {getProgramName(data.program)} is a yearlong program, meant to support
          you throughout your first year teaching the course. Starting in the
          summer, the program begins with a multi-day workshop to prepare you to
          start the year. During the school year, Academic Year Workshops will
          reinforce your skills and provide a community to get answers to
          questions you have during the year. The program concludes in the
          spring. Workshops will either be held in-person, virtually, or as a
          combination of both throughout the year.
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
