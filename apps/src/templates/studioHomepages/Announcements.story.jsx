import React from 'react';
import Announcements from './Announcements';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';

registerReducers({isRtl: isRtlReducer});
const store = getStore();

export default storybook => {
  return storybook
    .storiesOf('Announcements', module)
    .addStoryTable([
      {
        name: 'Announcements - 1 announcement',
        description: 'This is an example of of the Announcements section for the teacher homepage.',
        story: () => (
          <Provider store={store}>
            <Announcements
              announcements={[
                {
                  heading: "Go beyond an Hour of Code",
                  buttonText: "Go Beyond",
                  description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
                  link: "to wherever"
                },
              ]}
              isRtl={false}
            />
          </Provider>
        )
      },
      {
        name: 'Announcements - 3 announcements',
        description: 'This is an example of of the Announcements section for the teacher homepage.',
        story: () => (
          <Provider store={store}>
            <Announcements
              announcements={[
                {
                  heading: "Go beyond an Hour of Code",
                  buttonText: "Go Beyond",
                  description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
                  link: "to wherever"
                },
                {
                  heading: "Go way beyond an Hour of Code",
                  buttonText: "Go Beyond",
                  description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
                  link: "to wherever"
                },
                {
                  heading: "Go way, way beyond an Hour of Code",
                  buttonText: "Go Beyond",
                  description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
                  link: "to wherever"
                },
              ]}
              isRtl={false}
            />
          </Provider>
        )
      }
    ]);
};
