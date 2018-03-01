import React from 'react';
import QuickActionsCell from './QuickActionsCell';
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";

export default storybook => {
  storybook
    .storiesOf('QuickActionsCell', module)
    .addStoryTable([
        {
          name: 'QuickActionsCell',
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
      ]);
  };
