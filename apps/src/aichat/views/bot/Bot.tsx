import React from 'react';
import moduleStyles from '../chatWorkspace.module.scss';
import classNames from 'classnames';

const botImagePath = [
  [
    `/blockly/media/aichat/ai-bot-head-0-normal.png`,
    `/blockly/media/aichat/ai-bot-head-0-ooh.png`,
    `/blockly/media/aichat/ai-bot-head-0-sideeye.png`,
  ],
  [
    `/blockly/media/aichat/ai-bot-head-1-normal.png`,
    `/blockly/media/aichat/ai-bot-head-1-ooh.png`,
    `/blockly/media/aichat/ai-bot-head-1-sideeye.png`,
  ],
  [
    `/blockly/media/aichat/ai-bot-head-2-normal.png`,
    `/blockly/media/aichat/ai-bot-head-2-ooh.png`,
    `/blockly/media/aichat/ai-bot-head-2-sideeye.png`,
  ],
  [
    `/blockly/media/aichat/ai-bot-head-3-normal.png`,
    `/blockly/media/aichat/ai-bot-head-3-ooh.png`,
    `/blockly/media/aichat/ai-bot-head-3-sideeye.png`,
  ],
  [
    `/blockly/media/aichat/ai-bot-head-4-normal.png`,
    `/blockly/media/aichat/ai-bot-head-4-ooh.png`,
    `/blockly/media/aichat/ai-bot-head-4-sideeye.png`,
  ],
  [
    `/blockly/media/aichat/ai-bot-head-5-normal.png`,
    `/blockly/media/aichat/ai-bot-head-5-ooh.png`,
    `/blockly/media/aichat/ai-bot-head-5-sideeye.png`,
  ],
  [
    `/blockly/media/aichat/ai-bot-head-6-normal.png`,
    `/blockly/media/aichat/ai-bot-head-6-ooh.png`,
    `/blockly/media/aichat/ai-bot-head-6-sideeye.png`,
  ],
];

//const botImagePathStar = `/blockly/media/aichat/ai-bot-head1.png`;
const bodyImagePath = [
  `/blockly/media/aichat/ai-bot-body-1.png`,
  `/blockly/media/aichat/ai-bot-body-2.png`,
  `/blockly/media/aichat/ai-bot-body-3.png`,
  `/blockly/media/aichat/ai-bot-body-4.png`,
  `/blockly/media/aichat/ai-bot-body-5.png`,
  `/blockly/media/aichat/ai-bot-body-6.png`,
  `/blockly/media/aichat/ai-bot-body-7.png`,
  `/blockly/media/aichat/ai-bot-body-8.png`,
  `/blockly/media/aichat/ai-bot-body-9.png`,
  `/blockly/media/aichat/ai-bot-body-10.png`,
];
const hand0ImagePath = `/blockly/media/aichat/ai-bot-handL.png`;
const hand1ImagePath = `/blockly/media/aichat/ai-bot-handR.png`;
const foot0ImagePath = `/blockly/media/aichat/ai-bot-footL.png`;
const foot1ImagePath = `/blockly/media/aichat/ai-bot-footR.png`;

export interface BotState {
  head: any;
  headVariant: number;
  headSubVariant: number;
  body: any;
  bodyVariant: number;
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
          x1={botState.body[0] + 60}
          y1={botState.body[1] + 50}
          x2={botState.head[0] + 65}
          y2={botState.head[1] + 85}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="30px"
        ></line>
        <line
          x1={botState.body[0] + 60}
          y1={botState.body[1] + 50}
          x2={botState.head[0] + 65}
          y2={botState.head[1] + 85}
          stroke="grey"
          strokeWidth="30px"
          strokeDasharray="6 1"
        ></line>

        <line
          x1={botState.hand0[0] + 35}
          y1={botState.hand0[1] + 50 + 30}
          x2={botState.body[0] + 10}
          y2={botState.body[1] + 50}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="20px"
        ></line>
        <line
          x1={botState.hand0[0] + 35}
          y1={botState.hand0[1] + 50 + 30}
          x2={botState.body[0] + 10}
          y2={botState.body[1] + 50}
          stroke="grey"
          strokeWidth="20px"
          strokeDasharray="6 1"
        ></line>

        <line
          x1={botState.body[0] + 80}
          y1={botState.body[1] + 50}
          x2={botState.hand1[0] + 35}
          y2={botState.hand1[1] + 50 + 30}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="20px"
        ></line>
        <line
          x1={botState.body[0] + 80}
          y1={botState.body[1] + 50}
          x2={botState.hand1[0] + 35}
          y2={botState.hand1[1] + 50 + 30}
          stroke="grey"
          strokeWidth="20px"
          strokeDasharray="6 1"
        ></line>

        <line
          x1={botState.foot0[0] + 35}
          y1={botState.foot0[1] + 50}
          x2={botState.body[0] + 10}
          y2={botState.body[1] + 130}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="20px"
        ></line>
        <line
          x1={botState.foot0[0] + 35}
          y1={botState.foot0[1] + 50}
          x2={botState.body[0] + 10}
          y2={botState.body[1] + 130}
          stroke="grey"
          strokeWidth="20px"
          strokeDasharray="6 1"
        ></line>

        <line
          x1={botState.body[0] + 80}
          y1={botState.body[1] + 130}
          x2={botState.foot1[0] + 35}
          y2={botState.foot1[1] + 50}
          stroke="black"
          strokeLinecap="round"
          strokeWidth="20px"
        ></line>
        <line
          x1={botState.body[0] + 80}
          y1={botState.body[1] + 130}
          x2={botState.foot1[0] + 35}
          y2={botState.foot1[1] + 50}
          stroke="grey"
          strokeWidth="20px"
          strokeDasharray="6 1"
        ></line>
        {/*
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
        */}
      </svg>

      <img
        src={bodyImagePath[botState.bodyVariant]}
        style={{
          left: botState.body[0] - 30,
          top: botState.body[1],
        }}
        className={classNames(moduleStyles.bodyImage)}
      />

      <img
        src={botImagePath[botState.headVariant][botState.headSubVariant]}
        style={{
          left: botState.head[0],
          top: botState.head[1] + 30,
        }}
        className={classNames(moduleStyles.botImage)}
      />
      <img
        src={hand0ImagePath}
        style={{
          left: botState.hand0[0],
          top: botState.hand0[1] + 50,
        }}
        className={classNames(moduleStyles.hand0Image)}
      />
      <img
        src={hand1ImagePath}
        style={{
          left: botState.hand1[0],
          top: botState.hand1[1] + 50,
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
