import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import {Validation, ConditionType, AppName} from '../../types';
import {MusicConditions} from '@cdo/apps/music/progress/MusicValidator';
import {convertOptionalStringToBoolean} from '@cdo/apps/types/utils';
import {createUuid} from '@cdo/apps/utils';
import React, {useState} from 'react';
import moduleStyles from './edit-validations.module.scss';
import EditValidation from './EditValidation';

/**
 * This component is used to edit validations for a level. Currently only used
 * by Lab2 labs.
 */

const AppConditions: {[key in AppName]?: ConditionType[]} = {
  music: Object.values(MusicConditions),
};

interface EditValidationsProps {
  initialValidations: Validation[];
  levelName: string;
  appName: AppName;
}

/**
 * Top-level validations editor component.
 */
const EditValidations: React.FunctionComponent<EditValidationsProps> = ({
  initialValidations,
  levelName,
  appName,
}) => {
  const [validations, setValidations] = useState<Validation[]>(
    sanitizeValidations(initialValidations, levelName)
  );

  const conditionTypes = AppConditions[appName];

  if (conditionTypes === undefined || conditionTypes.length === 0) {
    return (
      <div>
        {`No validation conditions available for app type: ${appName}. Contact the engineering team for further details.`}
      </div>
    );
  }

  const onValidationChange = (validation: Validation) => {
    setValidations(
      sanitizeValidations(
        validations.map(v => {
          if (v.key === validation.key) {
            return validation;
          }
          return v;
        }),
        levelName
      )
    );
  };

  const deleteValidation = (key: string) => {
    setValidations(
      sanitizeValidations(
        validations.filter(validation => {
          return validation.key !== key;
        }),
        levelName
      )
    );
  };

  const moveValidation = (key: string, direction: 'up' | 'down') => {
    const index = validations.findIndex(validation => {
      return validation.key === key;
    });

    if (index === -1) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= validations.length) {
      return;
    }
    const newValidations = [...validations];
    const temp = newValidations[index];
    newValidations[index] = newValidations[newIndex];
    newValidations[newIndex] = temp;
    setValidations(newValidations);
  };

  const addValidation = () => {
    const newValidation: Validation = {
      key: levelName + '_' + createUuid(),
      message: '',
      next: false,
      conditions: [],
    };
    setValidations([...validations, newValidation]);
  };

  return (
    <div>
      <input
        type="hidden"
        id="level_validations"
        name="level[validations]"
        value={JSON.stringify(validations)}
      />
      <Typography
        semanticTag="p"
        visualAppearance="body-three"
        className={moduleStyles.title}
      >
        Edit validations for this level. Currently only supported by Lab2 labs.
        <br />
        NOTE: Validations are checked in the order they are listed. The first
        validation set that passes is the one that is displayed, so be sure to
        order your validation sets from most stringent to least.
      </Typography>
      {validations.map((validation, index) => {
        return (
          <EditValidation
            key={validation.key}
            index={index}
            validation={validation}
            onValidationChange={onValidationChange}
            deleteValidation={deleteValidation}
            conditionTypes={conditionTypes}
            moveValidation={moveValidation}
          />
        );
      })}
      <button
        type="button"
        className={moduleStyles.addValidationButton}
        onClick={addValidation}
      >
        + Add New Validation
      </button>
    </div>
  );
};

/**
 * Ensures that all validations have unique IDs and a conditions array.
 */
function sanitizeValidations(
  validations: Validation[],
  levelName: string
): Validation[] {
  return validations.map(validation => {
    if (!validation.key) {
      validation.key = levelName + '_' + createUuid();
    }
    validation.next = convertOptionalStringToBoolean(validation.next, false);
    if (!validation.conditions) {
      validation.conditions = [];
    }
    return validation;
  });
}

export default EditValidations;
