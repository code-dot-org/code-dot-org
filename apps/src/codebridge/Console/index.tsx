import {resetOutput} from '@codebridge/redux/consoleRedux';
import React from 'react';
import {useDispatch} from 'react-redux';

import Button from '@cdo/apps/componentLibrary/button';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './console.module.scss';

const Console: React.FunctionComponent = () => {
  const codeOutput = useAppSelector(state => state.codebridgeConsole.output);
  const dispatch = useDispatch();

  const clearOutput = () => {
    dispatch(resetOutput());
  };

  const headerButton = () => {
    return (
      <Button
        isIconOnly
        color={'black'}
        icon={{iconStyle: 'solid', iconName: 'broom'}}
        ariaLabel="clear console"
        onClick={clearOutput}
        size={'xs'}
      />
    );
  };

  return (
    <PanelContainer
      id="codebridge-console"
      className={moduleStyles.consoleContainer}
      headerContent={'Console'}
      rightHeaderContent={headerButton()}
    >
      <div className={moduleStyles.console}>
        {codeOutput.map((outputLine, index) => {
          if (outputLine.type === 'img') {
            return (
              <img
                key={index}
                src={`data:image/png;base64,${outputLine.contents}`}
                alt="matplotlib_image"
              />
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
          } else {
            return <div key={index}>[PYTHON LAB] {outputLine.contents}</div>;
          }
        })}
      </div>
    </PanelContainer>
  );
};

export default Console;
