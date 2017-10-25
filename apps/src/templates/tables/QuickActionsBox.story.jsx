import React from 'react';
import QuickActionsBox from './QuickActionsBox';
import QuickAction from './QuickAction';

export default storybook => {
  storybook
    .storiesOf('QuickActionsBox', module)
    .addStoryTable([
        {
          name: 'QuickActionsBox',
          description: 'Shown with 2 QuickActions as children',
          story: () => (
            <QuickActionsBox>
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
            </QuickActionsBox>
          )
        },
        {
          name: 'QuickActionsBox',
          description: 'Shown with 3 QuickActions as children',
          story: () => (
            <QuickActionsBox>
              <QuickAction
                text={"Share"}
                action={()=>{}}
                hasLineAbove={false}
                isDelete={false}
              />
              <QuickAction
                text={"Edit"}
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
            </QuickActionsBox>
          )
        },
        {
          name: 'QuickActionsBox',
          description: 'Shown with div tags as children',
          story: () => (
            <QuickActionsBox>
              <div>
                Hello
              </div>
              <div>
                World
              </div>
            </QuickActionsBox>
          )
        },
      ]);
  };
