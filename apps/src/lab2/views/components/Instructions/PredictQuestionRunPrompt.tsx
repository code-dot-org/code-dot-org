import Alert from '@code-dot-org/component-library/alert';
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
    return <Alert text="Submitted" type="success" size="s" />;
  } else {
    return null;
  }
};

export default PredictQuestionRunPrompt;
