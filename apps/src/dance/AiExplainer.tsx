import React from 'react';
import moduleStyles from './ai-explainer.module.scss';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
const Typist = require('react-typist').default;

interface AiExplainerProps {
  systemPrompt: string;
}

const AiExplainer: React.FunctionComponent<AiExplainerProps> = ({
  systemPrompt,
}) => {
  return (
    <AccessibleDialog className={moduleStyles.dialog} onClose={() => {}}>
      <div tabIndex={0}>
        <div className={moduleStyles.appear1}>
          <div className={moduleStyles.heading}>
            We give the LLM a system prompt:
          </div>
          <div className={moduleStyles.content}>{systemPrompt}</div>
        </div>
        <div className={moduleStyles.appear2}>
          <div className={moduleStyles.heading}>and the specific request:</div>
          <div className={moduleStyles.content}>
            use AI to show an exciting scene
          </div>
        </div>

        <div className={moduleStyles.appear3}>
          <div className={moduleStyles.heading}>
            Then it predicts the output:
          </div>
          <div className={moduleStyles.content}>
            <div className={moduleStyles.botContainer}>
              <img
                src={pegasus('/images/ai-bot.png')}
                className={moduleStyles.bot}
              />
            </div>
            <div className={moduleStyles.output}>
              <Typist startDelay={7000} cursor={{show: false}}>
                setBackgroundEffect('fireworks', 'neon');
                <br />
                <Typist.Delay ms={500} />
                this.setForegroundEffect('confetti');
              </Typist>
            </div>
          </div>
        </div>
      </div>
    </AccessibleDialog>
  );
};

export default AiExplainer;
