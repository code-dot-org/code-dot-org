import {action} from '@storybook/addon-actions';
import React, {useState, useEffect} from 'react';

import PopUpMenu from './PopUpMenu';

export default {
  component: PopUpMenu,
};

//
// STORIES
//

// This component is an integrated example for the <PopUpMenu>.
// It needs to be its own component so that it adheres to React hooks
// linting (i.e., this can't be a template or the exported story itself).
const BasicExampleComponent = props => {
  const [isOpen, setIsOpen] = useState(true);
  const targetPoint = React.createRef();
  const [targetPointRect, setTargetPointRect] = useState(null);

  useEffect(() => {
    if (!targetPointRect) {
      const rect = targetPoint.current.getBoundingClientRect();
      setTargetPointRect({
        top: rect.bottom,
        left: rect.left + rect.width / 2,
      });
    }
  }, [targetPoint, targetPointRect]);

  return (
    <div>
      The <tt>PopUpMenu</tt> component is absolutely-positioned.
      <div
        style={{
          border: 'solid black thin',
          margin: '1em',
          width: '50%',
        }}
        ref={targetPoint}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        It targets the bottom-center of this element.
      </div>
      {targetPointRect && (
        <PopUpMenu
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          targetPoint={targetPointRect}
        >
          <PopUpMenu.Item onClick={action('option 1')}>
            Option One
          </PopUpMenu.Item>
          <PopUpMenu.Item onClick={action('option 2')}>
            Option Two
          </PopUpMenu.Item>
          <PopUpMenu.Item onClick={action('option 3')}>
            Option Three
          </PopUpMenu.Item>
        </PopUpMenu>
      )}
    </div>
  );
};

export const BasicExample = args => <BasicExampleComponent {...args} />;
