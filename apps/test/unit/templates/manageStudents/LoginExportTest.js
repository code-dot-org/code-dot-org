import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import LoginExport from '@cdo/apps/templates/manageStudents/LoginExport';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

const DEFAULT_PROPS = {
  sectionCode: 'ABCDEF',
  sectionName: 'Section Name',
};

describe('LoginExport', () => {
  it('outputs login information for secret word sections', () => {
    const studentData = [
      {id: 1, name: 'studentb', secretWords: 'one two'},
      {id: 3, name: 'studenta', secretWords: 'three four'},
      {id: 0, name: '', secretWords: ''},
      {id: 2, name: 'studentf', secretWords: 'six seven'},
    ];

    const wrapper = shallow(
      <LoginExport
        {...DEFAULT_PROPS}
        students={studentData}
        sectionLoginType={SectionLoginType.word}
      />
    );

    const logins = wrapper.instance().generateLogins();
    expect(logins.length).toBe(3);
    expect(logins).toEqual([
      {
        ...DEFAULT_PROPS,
        sectionLoginType: 'word',
        studentName: 'studentb',
        studentLoginSecret: 'one two',
      },
      {
        ...DEFAULT_PROPS,
        sectionLoginType: 'word',
        studentName: 'studenta',
        studentLoginSecret: 'three four',
      },
      {
        ...DEFAULT_PROPS,
        sectionLoginType: 'word',
        studentName: 'studentf',
        studentLoginSecret: 'six seven',
      },
    ]);
  });

  it('outputs login information for secret picture sections', () => {
    const studentData = [
      {id: 1, name: 'studentb', secretPicturePath: 'wizard.png'},
      {id: 3, name: 'studenta', secretPicturePath: 'ghost.png'},
      {id: 0, name: '', secretPicturePath: ''},
      {id: 2, name: 'studentf', secretPicturePath: 'robot.png'},
    ];

    const wrapper = shallow(
      <LoginExport
        {...DEFAULT_PROPS}
        students={studentData}
        sectionLoginType={SectionLoginType.picture}
      />
    );

    const logins = wrapper.instance().generateLogins();
    expect(logins.length).toBe(3);
    expect(logins).toEqual([
      {
        ...DEFAULT_PROPS,
        sectionLoginType: 'picture',
        studentName: 'studentb',
        studentLoginSecret: pegasus('/images/wizard.png'),
      },
      {
        ...DEFAULT_PROPS,
        sectionLoginType: 'picture',
        studentName: 'studenta',
        studentLoginSecret: pegasus('/images/ghost.png'),
      },
      {
        ...DEFAULT_PROPS,
        sectionLoginType: 'picture',
        studentName: 'studentf',
        studentLoginSecret: pegasus('/images/robot.png'),
      },
    ]);
  });
});
