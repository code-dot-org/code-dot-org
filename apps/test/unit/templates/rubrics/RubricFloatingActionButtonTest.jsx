import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {UnconnectedRubricFloatingActionButton as RubricFloatingActionButton} from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import {render, screen} from '@testing-library/react';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import teacherPanel from '@cdo/apps/code-studio/teacherPanelRedux';
import {Provider} from 'react-redux';

const defaultProps = {
  rubric: {
    level: {
      name: 'test-level',
    },
    learningGoals: [
      {
        id: 1,
        key: 'abc',
        learningGoal: 'Learning Goal 1',
        aiEnabled: true,
        evidenceLevels: [
          {id: 1, understanding: 1, teacherDescription: 'lg level 1'},
        ],
        tips: 'Tips',
      },
    ],
  },
  currentLevelName: 'test-level',
  studentLevelInfo: null,
};

describe('RubricFloatingActionButton - React Testing Library', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections, teacherPanel});
  });

  afterEach(() => {
    restoreRedux();
  });

  describe('pulse animation', () => {
    beforeEach(() => {
      sinon.stub(sessionStorage, 'getItem');
    });

    afterEach(() => {
      sessionStorage.getItem.restore();
    });

    it('renders pulse animation when session storage is empty', () => {
      sessionStorage.getItem.withArgs('RubricFabOpenStateKey').returns(null);
      render(
        <Provider store={getStore()}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );
      const images = screen.getAllByRole('img');
      const preloader = images.find(
        i => i.id === 'unittest-fab-image-preloader'
      );
      preloader.onload();
      const buttons = screen.getAllByRole('button');
      const fab = buttons.find(b => b.id === 'ui-floatingActionButton');
      expect(fab.classList.contains('unittest-fab-pulse')).to.be.true;
    });

    it('does not render pulse animation when open state is present in session storage', () => {
      sessionStorage.getItem.withArgs('RubricFabOpenStateKey').returns(false);
      render(
        <Provider store={getStore()}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );
      const images = screen.getAllByRole('img');
      const preloader = images.find(
        i => i.id === 'unittest-fab-image-preloader'
      );
      preloader.onload();
      const buttons = screen.getAllByRole('button');
      const fab = buttons.find(b => b.id === 'ui-floatingActionButton');
      expect(fab.classList.contains('unittest-fab-pulse')).to.be.false;
    });
  });
});

describe('RubricFloatingActionButton - Enzyme', () => {
  it('begins closed when student level info is null', () => {
    const wrapper = shallow(<RubricFloatingActionButton {...defaultProps} />);
    expect(wrapper.find('RubricContainer').length).to.equal(1);
    expect(wrapper.find('RubricContainer').props().open).to.equal(false);
  });

  it('begins open when student level info is provided', () => {
    const wrapper = shallow(
      <RubricFloatingActionButton
        {...defaultProps}
        studentLevelInfo={{
          name: 'Grace Hopper',
        }}
      />
    );
    expect(wrapper.find('RubricContainer').length).to.equal(1);
  });

  it('opens RubricContainer when clicked', () => {
    const wrapper = shallow(<RubricFloatingActionButton {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(1);
    wrapper.find('button').simulate('click');
    expect(wrapper.find('RubricContainer').length).to.equal(1);
  });

  it('sends events when opened and closed', () => {
    const sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
    const reportingData = {unitName: 'test-2023', levelName: 'test-level'};
    const wrapper = shallow(
      <RubricFloatingActionButton
        {...defaultProps}
        reportingData={reportingData}
      />
    );
    wrapper.find('button').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_OPENED_FROM_FAB_EVENT,
      {
        ...reportingData,
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );
    wrapper.find('button').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_CLOSED_FROM_FAB_EVENT,
      {
        ...reportingData,
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );
    sendEventSpy.restore();
  });
});
