import React from 'react';
import QuickAction from './QuickAction';

export default storybook => {
  storybook
    .storiesOf('QuickAction', module)
    .addStoryTable([
        {
          name: 'Standard action',
          description: 'Standard action placed inside a div with set width',
          story: () => (
            <div style={{width: 200}}>
              <QuickAction
                text={"Action one"}
                action={()=>{}}
                hasLineAbove={false}
                isDelete={false}
              />
            </div>
          )
        },
        {
          name: 'Standard action with divider',
          description: 'Standard action placed inside a div with set width',
          story: () => (
            <div style={{width: 200}}>
              <QuickAction
                text={"Action two"}
                action={()=>{}}
                hasLineAbove={true}
                isDelete={false}
              />
            </div>
          )
        },
        {
          name: 'Delete action',
          description: 'Delete action placed inside a div with set width',
          story: () => (
            <div style={{width: 200}}>
              <QuickAction
                text={"Delete"}
                action={()=>{}}
                hasLineAbove={false}
                isDelete={true}
              />
            </div>
          )
        },
        {
          name: 'Delete action with divider',
          description: 'Delete action placed inside a div with set width with a divider above',
          story: () => (
            <div style={{width: 200}}>
              <QuickAction
                text={"Delete project"}
                action={()=>{}}
                hasLineAbove={true}
                isDelete={true}
              />
            </div>
          )
        },
      ]);
  };
