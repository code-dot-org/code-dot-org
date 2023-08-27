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
  body: any;
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
          x1={botState.hand0[0] + 35}
          y1={botState.hand0[1] + 30}
          x2={botState.body[0] + 10}
          y2={botState.body[1] + 30}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="10px"
          strokeDasharray="4 1"
        ></line>
        <line
          x1={botState.body[0] + 80}
          y1={botState.body[1] + 30}
          x2={botState.hand1[0] + 35}
          y2={botState.hand1[1] + 30}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="10px"
          strokeDasharray="4 1"
        ></line>

        <line
          x1={botState.foot0[0] + 35}
          y1={botState.foot0[1] + 50}
          x2={botState.body[0] + 10}
          y2={botState.body[1] + 130}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="10px"
          strokeDasharray="4 1"
        ></line>
        <line
          x1={botState.body[0] + 80}
          y1={botState.body[1] + 130}
          x2={botState.foot1[0] + 35}
          y2={botState.foot1[1] + 50}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="10px"
          strokeDasharray="4 1"
        ></line>

        <rect
          x={botState.body[0]}
          y={botState.body[1]}
          width="80"
          height="160"
          fill="white"
          rx="35"
          strokeWidth="3px"
          stroke="black"
        ></rect>
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
