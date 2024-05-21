import {resetOutput} from '@codebridge/redux/consoleRedux';
import React from 'react';
import {useDispatch} from 'react-redux';

import Button from '@cdo/apps/templates/Button';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './console.module.scss';

const Console: React.FunctionComponent = () => {
  const codeOutput = useAppSelector(state => state.codebridgeConsole.output);
  const dispatch = useDispatch();

  const clearOutput = () => {
    dispatch(resetOutput());
  };

  return (
    <div className={moduleStyles.consoleContainer}>
      <div>
        <Button type={'button'} text="Clear output" onClick={clearOutput} />
      </div>
      <div>
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
          } else {
            return <div key={index}>[PYTHON LAB] {outputLine.contents}</div>;
          }
        })}
      </div>
    </div>
  );
};

export default Console;
