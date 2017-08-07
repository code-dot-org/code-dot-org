import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {
  throwOnConsoleErrors,
  throwOnConsoleWarnings
} from '../../../util/testUtils';
import SectionsPage, {Breadcrumb} from '@cdo/apps/templates/teacherDashboard/SectionsPage';
import OwnedSections from '@cdo/apps/templates/teacherDashboard/OwnedSections';

describe('SectionsPage', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  it('renders a Breadcrumb and OwnedSections component', () => {
    expect(shallow(
      <SectionsPage/>
    )).to.containMatchingElement(
      <div>
        <Breadcrumb/>
        <OwnedSections/>
      </div>
    );
  });

  it('passes defaultCourseId and defaultScriptId props through to OwnedSections', () => {
    const courseId = Math.random();
    const scriptId = Math.random();
    expect(shallow(
      <SectionsPage
        defaultCourseId={courseId}
        defaultScriptId={scriptId}
      />
    )).to.containMatchingElement(
      <div>
        <Breadcrumb/>
        <OwnedSections
          defaultCourseId={courseId}
          defaultScriptId={scriptId}
        />
      </div>
    );
  });
});

describe('Breadcrumb', () => {
  it('renders a link to teacher dashboard and an orange studentAccountsAndProgress text', () => {
    expect(shallow(
      <Breadcrumb/>
    )).to.containMatchingElement(
      <div>
        <a href="/teacher-dashboard#/">
          Teacher home page
        </a>
        <span>
          {"\u00a0 \u25b6 \u00a0"}
        </span>
        <b style={{color: '#ff8600'}}>
          Student Accounts and Progress
        </b>
      </div>
    );
  });
});
