import React, {useState, useEffect} from 'react';
import {action} from '@storybook/addon-actions';
import PopUpMenu from './PopUpMenu';

export default {
  title: 'PopUpMenu',
  component: PopUpMenu
};

//
// STORIES
//

export const BasicExample = args => {
  const [isOpen, setIsOpen] = useState(true);
  const targetPoint = React.createRef();
  const [targetPointRect, setTargetPointRect] = useState(null);

  useEffect(() => {
    if (!targetPointRect) {
      const rect = targetPoint.current.getBoundingClientRect();
      setTargetPointRect({
        top: rect.bottom,
        left: rect.left + rect.width / 2
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
          width: '50%'
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
