import React from 'react';
import QuickActionsCell from './QuickActionsCell';
import QuickAction from './QuickAction';

export default storybook => {
  storybook
    .storiesOf('QuickActionsCell', module)
    .addStoryTable([
        {
          name: 'QuickActionsCell',
          description: 'Shown with 2 QuickActions as children',
          story: () => (
            <QuickActionsCell>
              <QuickAction
                text={"Action one"}
                action={()=>{}}
                hasLineAbove={false}
                isDelete={false}
              />
              <QuickAction
                text={"Delete project"}
                action={()=>{}}
                hasLineAbove={true}
                isDelete={true}
              />
            </QuickActionsCell>
          )
        },
      ]);
  };
