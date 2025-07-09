import Alert from '@code-dot-org/component-library/alert';
import classNames from 'classnames';
import React from 'react';

import {isPredictAnswerLocked} from '@cdo/apps/lab2/redux/predictLevelRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './predict.module.scss';

/**
 * A simple prompt reminding users to click the Run button
 */
const PredictQuestionRunPrompt: React.FunctionComponent = () => {
  const hasSelected = useAppSelector(state => !!state.predictLevel.response);
  const isLocked = useAppSelector(isPredictAnswerLocked);
  if (hasSelected && !isLocked) {
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
  } else if (isLocked) {
    return (
      <Alert
        text="Submitted"
        type="success"
        size="s"
        className={moduleStyles.successAlert}
      />
    );
  } else {
    return null;
  }
};

export default PredictQuestionRunPrompt;
