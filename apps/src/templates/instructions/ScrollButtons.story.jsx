import React from 'react';
import ScrollButtons from './ScrollButtons';

export default {
  title: 'ScrollButtons',
  component: ScrollButtons,
};

const Template = args => {
  let container;
  return (
    <div style={{minWidth: 200}}>
      <div
        style={{
          float: 'left',
          overflowY: 'hidden',
          height: 200,
          width: '80%',
        }}
        ref={c => {
          container = c;
        }}
      >
        <div
          style={{
            height: 500,
            background: 'linear-gradient(red, yellow)',
          }}
        />
      </div>
      <div style={{float: 'left', width: '10%'}}>
        <ScrollButtons
          style={{
            position: 'relative',
          }}
          getScrollTarget={() => container}
          height
          isMinecraft
          visible
          {...args}
        />
      </div>
    </div>
  );
};

export const BasicExample = Template.bind({});
BasicExample.args = {
  height: 200,
  isMinecraft: false,
};

export const MinecraftExample = Template.bind({});
MinecraftExample.args = {
  height: 200,
  isMinecraft: true,
};
