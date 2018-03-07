import React from 'react';
import QuickActionsCell from './QuickActionsCell';
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";

export default storybook => {
  storybook
    .storiesOf('QuickActionsCell', module)
    .addStoryTable([
        {
          name: 'QuickActionsCell - 2 children',
          description: 'Shown with 2 QuickActions as children',
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
          name: 'QuickActionsCell - different icon',
          description: 'Override the default cheveron down icon',
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
