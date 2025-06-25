import classNames from 'classnames';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './predict.module.scss';

/**
 * A simple prompt reminding users to click the Run button
 */
const PredictQuestionRunPrompt: React.FunctionComponent = () => {
  return (
    <div
      className={classNames(
        moduleStyles.predictQuestionContainer,
        moduleStyles.runPromptContainer
      )}
    >
      <SafeMarkdown
        markdown={commonI18n.predictQuestionRunPrompt()}
        className={moduleStyles.runPrompt}
      />
    </div>
  );
};

export default PredictQuestionRunPrompt;
