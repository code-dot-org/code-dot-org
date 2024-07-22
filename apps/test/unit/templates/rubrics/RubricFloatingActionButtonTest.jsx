import {render, screen, fireEvent} from '@testing-library/react';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import teacherPanel from '@cdo/apps/code-studio/teacherPanelRedux';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import {UnconnectedRubricFloatingActionButton as RubricFloatingActionButton} from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn().mockResolvedValue({
    json: jest.fn().mockReturnValue({}),
  }),
}));

fetch.mockIf(/\/rubrics\/.*/, JSON.stringify(''));

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
      sessionStorage.removeItem('RubricFabOpenStateKey');
    });

    it('renders pulse animation when session storage is empty', () => {
      const sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
      render(
        <Provider store={getStore()}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );
      expect(sendEventSpy).to.have.been.calledWith(
        EVENTS.TA_RUBRIC_CLOSED_ON_PAGE_LOAD,
        {
          viewingStudentWork: false,
          viewingEvaluationLevel: true,
        }
      );
      const fab = screen.getByRole('button', {name: 'AI bot'});
      expect(fab.classList.contains('unittest-fab-pulse')).to.be.false;

      const fabImage = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(fabImage);
      expect(fab.classList.contains('unittest-fab-pulse')).to.be.false;

      const taImage = screen.getByRole('img', {name: 'TA overlay'});
      fireEvent.load(taImage);
      expect(fab.classList.contains('unittest-fab-pulse')).to.be.true;
      sendEventSpy.restore();
    });

    it('sends open on page load event when open state is true in session storage', () => {
      const sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
      sessionStorage.setItem('RubricFabOpenStateKey', 'true');
      render(
        <Provider store={getStore()}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );
      expect(sendEventSpy).to.have.been.calledWith(
        EVENTS.TA_RUBRIC_OPEN_ON_PAGE_LOAD,
        {
          viewingStudentWork: false,
          viewingEvaluationLevel: true,
        }
      );
      const image = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(image);
      const fab = screen.getByRole('button', {name: 'AI bot'});
      expect(fab.classList.contains('unittest-fab-pulse')).to.be.false;
      sendEventSpy.restore();
    });

    it('does not render pulse animation when open state is present in session storage', () => {
      const sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
      sessionStorage.setItem('RubricFabOpenStateKey', 'false');
      render(
        <Provider store={getStore()}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );
      expect(sendEventSpy).to.have.been.calledWith(
        EVENTS.TA_RUBRIC_CLOSED_ON_PAGE_LOAD,
        {
          viewingStudentWork: false,
          viewingEvaluationLevel: true,
        }
      );
      const image = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(image);
      const fab = screen.getByRole('button', {name: 'AI bot'});
      expect(fab.classList.contains('unittest-fab-pulse')).to.be.false;
      sendEventSpy.restore();
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
