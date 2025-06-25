import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './predict.module.scss';

interface PredictQuestionRunPromptProps {
  className?: string;
}

/**
 * A simple prompt reminding users to click the Run button
 */
const PredictQuestionRunPrompt: React.FC<
  PredictQuestionRunPromptProps
> = () => {
  return (
    <div className={moduleStyles.predictQuestionContainer}>
      <div className={moduleStyles.runPrompt}>
        <SafeMarkdown markdown={commonI18n.predictQuestionRunPrompt()} />
      </div>
    </div>
  );
};

export default PredictQuestionRunPrompt;
