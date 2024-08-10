import React from 'react';
import {Provider} from 'react-redux';

import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import {reduxStore} from '@cdo/storybook/decorators';

import SectionLoginInfo from './SectionLoginInfo';
import teacherSections from './teacherSectionsRedux';

export default {
  component: SectionLoginInfo,
};

const Template = args => (
  <Provider store={args.store}>
    <SectionLoginInfo studioUrlPrefix="http://studio.code.org.localhost:3000" />
  </Provider>
);

const createStore = loginType => {
  return reduxStore(
    {teacherSections},
    {
      teacherSections: {
        selectedSectionId: 1,
        sections: {
          1: {
            id: 1,
            loginType: loginType,
            code: 'ABCDE',
          },
        },
        selectedStudents: [],
      },
    }
  );
};
export const Word = Template.bind({});
Word.args = {
  store: createStore(SectionLoginType.word),
};

export const Picture = Template.bind({});
Picture.args = {
  store: createStore(SectionLoginType.picture),
};
export const Email = Template.bind({});
Email.args = {
  store: createStore(SectionLoginType.email),
};

export const Google = Template.bind({});
Google.args = {
  store: createStore(SectionLoginType.google_classroom),
};

export const Clever = Template.bind({});
Clever.args = {
  store: createStore(SectionLoginType.clever),
};
export const LTI = Template.bind({});
LTI.args = {
  store: createStore(SectionLoginType.lti_v1),
};
