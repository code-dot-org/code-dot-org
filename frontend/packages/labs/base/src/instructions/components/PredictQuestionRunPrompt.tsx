import classNames from 'classnames';
import type {FunctionComponent} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import {Markdown} from '@code-dot-org/platform';

import {isPredictAnswerLocked} from '../../redux/predictLevelSlice';
import {useAppSelector} from '../../redux/store';

import moduleStyles from './predict.module.scss';

/**
 * A simple prompt reminding users to click the Run button
 */
const PredictQuestionRunPrompt: FunctionComponent = () => {
  const hasSelected = useAppSelector(state => !!state.predictLevel.response);
  const isLocked = useAppSelector(isPredictAnswerLocked);
  if (hasSelected && !isLocked) {
    return (
      <div
        className={classNames(
          moduleStyles.predictQuestionContainer,
          moduleStyles.runPromptContainer,
        )}
      >
        <Markdown
          className={moduleStyles.runPrompt}
          children="Click the *Run* button to submit your answer and continue."
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
