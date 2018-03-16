import React from 'react';
import QuickActionsCell from './QuickActionsCell';
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";

export default storybook => {
  storybook
    .storiesOf('QuickActionsCell', module)
    .addStoryTable([
        {
          name: 'QuickActionsCell - default body',
          description: 'Shown with 2 QuickActions as children, the default body cell has a down chevron',
          story: () => (
            <QuickActionsCell>
              <PopUpMenu.Item
                onClick={() => {console.log("clicked");}}
              >
                {"Action 1"}
              </PopUpMenu.Item>
              <MenuBreak/>
              <PopUpMenu.Item
                onClick={() => {console.log("clicked");}}
              >
                {"Action 2"}
              </PopUpMenu.Item>
            </QuickActionsCell>
          )
        },
        {
          name: 'QuickActionsCell - header',
          description: 'Override the default cheveron down icon for use in the header cell',
          story: () => (
            <QuickActionsCell
              type="header"
            >
              <PopUpMenu.Item
                onClick={() => {console.log("clicked");}}
              >
                {"Action 1"}
              </PopUpMenu.Item>
              <MenuBreak/>
              <PopUpMenu.Item
                onClick={() => {console.log("clicked");}}
              >
                {"Action 2"}
              </PopUpMenu.Item>
            </QuickActionsCell>
          )
        },
      ]);
  };
