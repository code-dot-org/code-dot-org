import React from 'react';
import moduleStyles from './chatWorkspace.module.scss';
import classNames from 'classnames';

const botImagePath = `/blockly/media/aichat/ai-bot-default.svg`;
const hand0ImagePath = `/blockly/media/aichat/ai-bot-hand-0.png`;
const hand1ImagePath = `/blockly/media/aichat/ai-bot-hand-1.png`;
const foot0ImagePath = `/blockly/media/aichat/ai-bot-foot-0.png`;
const foot1ImagePath = `/blockly/media/aichat/ai-bot-foot-1.png`;

interface DancingBotProps {
  danceState: any;
}

const DancingBot: React.FunctionComponent<DancingBotProps> = ({danceState}) => {
  return (
    <div id="dancing-bot" className={moduleStyles.dancingBot}>
      <svg
        className={moduleStyles.svgViewBox}
        viewBox="0 0 350 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="60"
          y1="160"
          x2="140"
          y2="180"
          stroke="black"
          strokeLinecap="round"
          strokeWidth="10px"
          strokeDasharray="4 1"
        ></line>
        <line
          x1="200"
          y1="180"
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
        className={classNames(
          moduleStyles.botImage,
          danceState?.shakeBody && moduleStyles.verticalShake
        )}
      />
      <img
        src={hand0ImagePath}
        className={classNames(
          moduleStyles.hand0Image,
          danceState?.shakeHands && moduleStyles.shake
        )}
      />
      <img
        src={hand1ImagePath}
        className={classNames(
          moduleStyles.hand1Image,
          danceState?.shakeHands && moduleStyles.shake
        )}
      />
      <img
        src={foot0ImagePath}
        className={classNames(
          moduleStyles.foot0Image,
          danceState?.tapFeet && moduleStyles.angleShake
        )}
      />
      <img
        src={foot1ImagePath}
        className={classNames(moduleStyles.foot1Image)}
      />
    </div>
  );
};

export default DancingBot;
