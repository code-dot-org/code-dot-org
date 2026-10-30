import React from 'react';

import PopUpMenu, {MenuBreak} from '@cdo/apps/sharedComponents/PopUpMenu';

import QuickActionsCell from './QuickActionsCell';

export default {
  component: QuickActionsCell,
};

const Template = args => (
  <div style={{marginLeft: 100}}>
    <QuickActionsCell type={args.type}>
      <PopUpMenu.Item
        onClick={() => {
          console.log('clicked');
        }}
      >
        {'Action 1'}
      </PopUpMenu.Item>
      <MenuBreak />
      <PopUpMenu.Item
        onClick={() => {
          console.log('clicked');
        }}
      >
        {'Action 2'}
      </PopUpMenu.Item>
    </QuickActionsCell>
  </div>
);

export const DefaultBody = Template.bind({});
DefaultBody.args = {type: 'body'};

export const ChevronOverride = Template.bind({});
ChevronOverride.args = {type: 'header'};
