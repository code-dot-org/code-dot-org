import React from 'react';
import {useSelector} from 'react-redux';
import SelectCompilationButton from './selectCompilationButton';
import SelectValidationButton from './selectValidationButton';
import SelectGeneralChatButton from './selectGeneralChatButton';
import {AITutorState} from '@cdo/apps/aiTutor/redux/aiTutorRedux';

const TutorTypeSelector: React.FunctionComponent = () => {
  const level = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.level
  );
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
