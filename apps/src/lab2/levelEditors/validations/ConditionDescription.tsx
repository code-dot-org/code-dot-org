import React from 'react';

import {Condition, ConditionType} from '../../types';

import moduleStyles from './edit-validations.module.scss';

interface ConditionDescriptionProps {
  condition: Condition;
  conditionTypes: ConditionType[];
}

/**
 * Displays the description for the selected condition.
 */
const ConditionDescription: React.FunctionComponent<
  ConditionDescriptionProps
> = ({condition, conditionTypes}) => {
  const conditionType = conditionTypes.find(
    type => type.name === condition.name
  );

  return (
    <div className={moduleStyles.row}>
      {conditionType?.description && <i>{conditionType.description}</i>}
    </div>
  );
};

export default ConditionDescription;
