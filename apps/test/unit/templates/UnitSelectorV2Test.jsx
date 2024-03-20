import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {expect} from '../../util/reconfiguredChai';
import {UnconnectedUnitSelectorV2} from '@cdo/apps/templates/UnitSelectorV2';
import {fakeCoursesWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';
import * as sectionProgressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import sinon from 'sinon';

const DEFAULT_PROPS = {
  coursesWithProgress: fakeCoursesWithProgress,
  scriptId: 2, // Course A (2018)
  sectionId: 1,
  setScriptId: () => {},
  onChange: () => {},
  asyncLoadCoursesWithProgress: () => {},
  isLoadingCourses: false,
};

describe('UnitSelector', () => {
  beforeEach(() => {
    sinon.stub(sectionProgressLoader, 'loadUnitProgress');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('loads the correct number of course versions', () => {
    render(<UnconnectedUnitSelectorV2 {...DEFAULT_PROPS} />);
    const dropdown = screen.getByRole('combobox');
    fireEvent.click(dropdown);

    screen.getByRole('group', {name: 'Course A'});
    screen.getByRole('group', {name: 'CS Discoveries 2018'});
    screen.getByRole('group', {name: 'Flappy'});

    screen.getByRole('option', {name: 'Course A (2018)'});
    screen.getByRole('option', {name: 'Course A (2017)'});
    screen.getByRole('option', {name: 'Unit 1'});
    screen.getByRole('option', {name: 'Unit 2'});
    screen.getByRole('option', {name: 'Flappy'});
  });

  it('sets scriptId on change', () => {
    const setScriptId = sinon.spy();
    render(
      <UnconnectedUnitSelectorV2 {...DEFAULT_PROPS} setScriptId={setScriptId} />
    );
    const dropdown = screen.getByRole('combobox');
    fireEvent.click(dropdown);

    const option = screen.getByRole('option', {name: 'Flappy'});
    fireEvent.change(dropdown, {target: {value: option.value}});

    expect(setScriptId).to.have.been.calledOnce;
  });

  it('loads courses on initial render', () => {
    const asyncLoadCoursesWithProgress = sinon.spy();
    render(
      <UnconnectedUnitSelectorV2
        {...DEFAULT_PROPS}
        asyncLoadCoursesWithProgress={asyncLoadCoursesWithProgress}
      />
    );

    expect(asyncLoadCoursesWithProgress).to.have.been.calledOnce;
  });

  it('shows skeleton if loading', () => {
    render(
      <UnconnectedUnitSelectorV2 {...DEFAULT_PROPS} isLoadingCourses={true} />
    );
    expect(screen.queryByRole('select')).to.be.null;
  });
});
