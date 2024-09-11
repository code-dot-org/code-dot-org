import {resetOutput} from '@codebridge/redux/consoleRedux';
import SwapLayoutButton from '@codebridge/SwapLayoutButton';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import ControlButtons from './ControlButtons';
import GraphModal from './GraphModal';

import moduleStyles from './console.module.scss';

interface ConsoleProps {
  style?: React.CSSProperties;
}

const Console: React.FunctionComponent<ConsoleProps> = ({style}) => {
  const codeOutput = useAppSelector(state => state.codebridgeConsole.output);
  const dispatch = useDispatch();
  const levelId = useAppSelector(state => state.lab.levelProperties?.id);
  const previousLevelId = useRef(levelId);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [activeGraphIndex, setActiveGraphIndex] = useState(0);

  // TODO: Update this with other apps that use the console as needed.
  const systemMessagePrefix = appName === 'pythonlab' ? '[PYTHON LAB] ' : '';

  useEffect(() => {
    // If the level changes, clear the console.
    if (previousLevelId.current !== levelId) {
      dispatch(resetOutput());
      previousLevelId.current = levelId;
    }
  }, [dispatch, levelId]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [codeOutput]);

  const clearOutput = () => {
    dispatch(resetOutput());
    setGraphModalOpen(false);
  };

  const popOutGraph = (index: number) => {
    setActiveGraphIndex(index);
    setGraphModalOpen(true);
  };

  const headerButton = () => {
    return (
      <>
        <Button
          isIconOnly
          color={'black'}
          icon={{iconStyle: 'solid', iconName: 'eraser'}}
          ariaLabel="clear console"
          onClick={clearOutput}
          size={'xs'}
        />
        <SwapLayoutButton />
      </>
    );
  };

  return (
    <PanelContainer
      id="codebridge-console"
      className={moduleStyles.consoleContainer}
      headerContent={'Console'}
      rightHeaderContent={headerButton()}
      leftHeaderContent={<ControlButtons />}
      headerClassName={moduleStyles.consoleHeader}
      style={style}
    >
      <div className={moduleStyles.console}>
        {codeOutput.map((outputLine, index) => {
          if (outputLine.type === 'img') {
            return (
              <div key={index}>
                <img
                  src={`data:image/png;base64,${outputLine.contents}`}
                  alt="matplotlib_image"
                />
                <Button
                  color={buttonColors.black}
                  disabled={false}
                  icon={{
                    iconName: 'up-right-from-square',
                    iconStyle: 'solid',
                  }}
                  isIconOnly={true}
                  onClick={() => popOutGraph(index)}
                  size="xs"
                  type="primary"
                  aria-label="open matplotlib_image in pop-up"
                />
                {activeGraphIndex === index && graphModalOpen && (
                  <GraphModal
                    src={`data:image/png;base64,${outputLine.contents}`}
                    onClose={() => setGraphModalOpen(false)}
                  />
                )}
              </div>
            );
          } else if (
            outputLine.type === 'system_out' ||
            outputLine.type === 'system_in'
          ) {
            return <div key={index}>{outputLine.contents}</div>;
          } else if (outputLine.type === 'error') {
            return (
              <div key={index} className={moduleStyles.errorLine}>
                {outputLine.contents}
              </div>
            );
          } else if (outputLine.type === 'system_error') {
            return (
              <div key={index} className={moduleStyles.errorLine}>
                {systemMessagePrefix}
                {codebridgeI18n.systemCodeError()}
              </div>
            );
          } else {
            return (
              <div key={index}>
                {systemMessagePrefix}
                {outputLine.contents}
              </div>
            );
          }
        })}
        <div ref={scrollAnchorRef} />
      </div>
    </PanelContainer>
  );
};

export default Console;
