import React from 'react';
import QuickActionsCell from './QuickActionsCell';
import PopUpMenu, {MenuBreak} from '@cdo/apps/lib/ui/PopUpMenu';

export default {
  title: 'QuickActionsCell',
  component: QuickActionsCell
};

export const DefaultBody = () => (
  <QuickActionsCell>
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
);

export const ChevronOverride = () => (
  <QuickActionsCell type="header">
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
);
