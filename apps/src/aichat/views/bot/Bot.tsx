import React from 'react';
import moduleStyles from '../chatWorkspace.module.scss';
import classNames from 'classnames';

const botImagePath = `/blockly/media/aichat/ai-bot-default.svg`;
const hand0ImagePath = `/blockly/media/aichat/ai-bot-hand-0.png`;
const hand1ImagePath = `/blockly/media/aichat/ai-bot-hand-1.png`;
const foot0ImagePath = `/blockly/media/aichat/ai-bot-foot-0.png`;
const foot1ImagePath = `/blockly/media/aichat/ai-bot-foot-1.png`;

export interface BotState {
  head: any;
  hand0: any;
  hand1: any;
  foot0: any;
  foot1: any;
}

interface BotProps {
  botState: BotState;
}

const Bot: React.FunctionComponent<BotProps> = ({botState}) => {
  return (
    <div id="bot" className={moduleStyles.dancingBot}>
      <svg
        className={moduleStyles.svgViewBox}
        viewBox="0 0 350 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="60"
          y1="160"
          x2={botState.head[0] + 40}
          y2={botState.head[1] + 180}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="10px"
          strokeDasharray="4 1"
        ></line>
        <line
          x1={botState.head[0] + 100}
          y1={botState.head[1] + 180}
          x2="300"
          y2="160"
          stroke="black"
          strokeLinecap="round"
          strokeWidth="10px"
          strokeDasharray="4 1"
        ></line>
      </svg>
      <img
        src={botImagePath}
        style={{
          left: botState.head[0],
          top: botState.head[1],
        }}
        className={classNames(moduleStyles.botImage)}
      />
      <img
        src={hand0ImagePath}
        style={{
          left: botState.hand0[0],
          top: botState.hand0[1],
        }}
        className={classNames(moduleStyles.hand0Image)}
      />
      <img
        src={hand1ImagePath}
        style={{
          left: botState.hand1[0],
          top: botState.hand1[1],
        }}
        className={classNames(moduleStyles.hand1Image)}
      />
      <img
        src={foot0ImagePath}
        style={{
          left: botState.foot0[0],
          top: botState.foot0[1],
        }}
        className={classNames(moduleStyles.foot0Image)}
      />
      <img
        src={foot1ImagePath}
        style={{
          left: botState.foot1[0],
          top: botState.foot1[1],
        }}
        className={classNames(moduleStyles.foot1Image)}
      />
    </div>
  );
};

export default Bot;
