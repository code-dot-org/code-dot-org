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
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  if (appName === 'weblab2') {
    return null;
  }
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
  } else {
    return null;
  }
};

export default PredictQuestionRunPrompt;
