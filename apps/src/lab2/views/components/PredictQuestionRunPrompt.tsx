import classNames from 'classnames';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './predict.module.scss';

interface PredictQuestionRunPromptProps {
  hasSelected: boolean;
  hasSubmitted: boolean;
}

/**
 * A simple prompt reminding users to click the Run button
 */
const PredictQuestionRunPrompt: React.FunctionComponent<
  PredictQuestionRunPromptProps
> = ({hasSelected, hasSubmitted}) => {
  if (hasSelected && !hasSubmitted) {
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
  } else if (hasSubmitted) {
    return <div>Submitted</div>;
  } else {
    return null;
  }
};

export default PredictQuestionRunPrompt;
