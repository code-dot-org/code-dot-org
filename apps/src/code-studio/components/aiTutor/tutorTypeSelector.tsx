import React from 'react';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import SelectCompilationButton from './selectCompilationButton';
import SelectValidationButton from './selectValidationButton';
import SelectGeneralChatButton from './selectGeneralChatButton';

const TutorTypeSelector: React.FunctionComponent = () => {
  const level = useAppSelector(state => state.aiTutor.level);
  const isCodingLevel = level?.type === 'Javalab';

  return (
    <div>
      {isCodingLevel && <SelectCompilationButton />}
      {level?.hasValidation && <SelectValidationButton />}
      <SelectGeneralChatButton />
    </div>
  );
};

export default TutorTypeSelector;
