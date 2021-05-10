import React from 'react';

import ScrollButtons from './ScrollButtons';

export default storybook => {
  return storybook.storiesOf('ScrollButtons', module).addStoryTable([
    {
      name: 'Scroll Buttons',
      story: () => {
        let container;
        return (
          <div style={{minWidth: 200}}>
            <div
              style={{
                float: 'left',
                overflowY: 'hidden',
                height: 200,
                width: '80%'
              }}
              ref={c => {
                container = c;
              }}
            >
              <div
                style={{
                  height: 1000,
                  background: 'linear-gradient(red, yellow)'
                }}
              />
            </div>
            <div style={{float: 'left', width: '10%'}}>
              <ScrollButtons
                style={{
                  position: 'relative'
                }}
                getScrollTarget={() => container}
                height={200}
                isMinecraft={false}
                visible
              />
            </div>
          </div>
        );
      }
    }
  ]);
};
