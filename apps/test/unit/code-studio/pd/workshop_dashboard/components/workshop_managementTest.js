import {WorkshopManagement} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_management';
import {WorkshopTypes} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import ConfirmationDialog from '@cdo/apps/code-studio/pd/components/confirmation_dialog';
import {Button} from 'react-bootstrap';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Permission, {
  Organizer,
  ProgramManager,
  Facilitator
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';

const defaultProps = {
  permission: new Permission(),
  course: 'CS Principles',
  workshopId: 123,
  viewUrl: 'viewUrl',
  date: '2017-07-01'
};

describe('WorkshopManagement', () => {
  const fakeRouter = {
    createHref() {},
    push() {}
  };
  const context = {
    router: fakeRouter
  };
  const mockClickEvent = {
    preventDefault() {}
  };

  let mockRouter;

  beforeEach(() => {
    mockRouter = sinon.mock(fakeRouter);
  });

  afterEach(() => {
    mockRouter.verify();
  });

  let workshopManagement;
  const findButtons = () => workshopManagement.find(Button);
  const findButtonWithText = text => {
    const filtered = findButtons().filterWhere(
      b =>
        b
          .children()
          .first()
          .text() === text
    );
    expect(filtered).to.have.length(1);
    return filtered.first();
  };

  const verifyViewWorkshopButton = () => {
    const viewWorkshopButton = findButtonWithText('View Workshop');
    expect(viewWorkshopButton.props().href).to.eql('viewHref');

    mockRouter.expects('push').withExactArgs('viewUrl');
    viewWorkshopButton.simulate('click', mockClickEvent);
  };

  describe('with showSurveyUrl', () => {
    const getSurveyUrlForProps = props =>
      shallow(
        <WorkshopManagement
          {...defaultProps}
          showSurveyUrl={true}
          {...props}
        />,
        {context}
      ).instance().surveyUrl;

    it('uses foorm results for 5-day summer workshop past May 2020', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2020-06-01',
        subject: '5-day Summer'
      });
      expect(surveyUrl).to.eql('/workshop_daily_survey_results/123');
    });

    it('uses foorm results for Intro workshop past May 2020', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2020-05-08',
        subject: 'Intro'
      });
      expect(surveyUrl).to.eql('/workshop_daily_survey_results/123');
    });

    it('uses daily results for academic year workshop past August 2018', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2018-09-01',
        subject: 'Academic Year Workshop 1'
      });
      expect(surveyUrl).to.eql('/daily_survey_results/123');
    });

    it('uses survey results for academic year workshop before August 2018', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2018-07-01',
        subject: 'Academic Year Workshop 1'
      });
      expect(surveyUrl).to.eql(null);
    });

    it('uses daily results for local summer in 2018', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2018-07-01',
        subject: WorkshopTypes.local_summer
      });
      expect(surveyUrl).to.eql('/daily_survey_results/123');
    });

    it('uses daily results for teachercon in 2018', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2018-07-01',
        subject: WorkshopTypes.teachercon
      });
      expect(surveyUrl).to.eql('/daily_survey_results/123');
    });

    it('uses local summer results for local summer in 2017', () => {
      const surveyUrl = getSurveyUrlForProps({
        subject: WorkshopTypes.local_summer
      });
      expect(surveyUrl).to.eql('/local_summer_workshop_survey_results/123');
    });

    it('uses organizer results for organizers', () => {
      const organizerPermission = new Permission([Organizer]);
      const surveyUrl = getSurveyUrlForProps({permission: organizerPermission});
      expect(surveyUrl).to.eql(null);
    });

    it('uses organizer results for program managers', () => {
      const programManagerPermission = new Permission([ProgramManager]);
      const surveyUrl = getSurveyUrlForProps({
        permission: programManagerPermission
      });
      expect(surveyUrl).to.eql(null);
    });

    it('uses survey_results by default', () => {
      const surveyUrl = getSurveyUrlForProps();
      expect(surveyUrl).to.eql(null);
    });
  });

  describe('For not-started workshops', () => {
    let deleteStub;

    beforeEach(() => {
      deleteStub = sinon.spy();
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .returns('viewHref')
        .atLeast(1);
      mockRouter
        .expects('createHref')
        .withExactArgs('editUrl')
        .returns('editHref')
        .atLeast(1);

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          editUrl="editUrl"
          onDelete={deleteStub}
        />,
        {context}
      );
    });

    afterEach(() => {
      expect(deleteStub.notCalled).to.be.true;
    });

    it('Has 3 buttons', () => {
      expect(findButtons()).to.have.length(3);
    });

    it('Has a view workshop button', () => {
      verifyViewWorkshopButton();
    });

    it('Has an edit button', () => {
      const editButton = findButtonWithText('Edit');
      expect(editButton.props().href).to.eql('editHref');

      mockRouter.expects('push').withExactArgs('editUrl');
      editButton.simulate('click', mockClickEvent);
    });

    it('Has a delete button', () => {
      const deleteButton = findButtonWithText('Delete');

      deleteButton.simulate('click', mockClickEvent);
      expect(workshopManagement.state().showDeleteConfirmation).to.be.true;
    });

    describe('Delete confirmation', () => {
      let deleteConfirmationDialog;
      beforeEach(() => {
        workshopManagement.setState({showDeleteConfirmation: true});
        deleteConfirmationDialog = workshopManagement.find(ConfirmationDialog);
      });

      it('Is displayed when showDeleteConfirmation is set', () => {
        expect(deleteConfirmationDialog).to.have.length(1);
        expect(deleteConfirmationDialog.props().onOk).to.eql(
          workshopManagement.instance().handleDeleteConfirmed
        );
        expect(deleteConfirmationDialog.props().onCancel).to.eql(
          workshopManagement.instance().handleDeleteCanceled
        );
      });

      it('Goes away when canceled', () => {
        deleteConfirmationDialog.props().onCancel();
        expect(workshopManagement.state().showDeleteConfirmation).to.be.false;
      });

      it('Calls the supplied onDelete func when confirmed', () => {
        deleteConfirmationDialog.props().onOk();
        expect(deleteStub.withArgs(123).calledOnce).to.be.true;
        deleteStub.resetHistory();
      });
    });
  });

  describe('For in-progress workshops', () => {
    beforeEach(() => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .returns('viewHref')
        .atLeast(1);

      workshopManagement = shallow(<WorkshopManagement {...defaultProps} />, {
        context
      });
    });

    it('Has only a view workshop button', () => {
      expect(findButtons()).to.have.length(1);
      verifyViewWorkshopButton();
    });
  });

  describe('For completed workshops to a workshop organizer', () => {
    beforeEach(() => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .returns('viewHref');

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          permission={new Permission([Organizer])}
          showSurveyUrl={true}
        />,
        {context}
      );
    });

    it('Has 1 button', () => {
      expect(findButtons()).to.have.length(1);
    });

    it('Has a view workshop button', () => {
      verifyViewWorkshopButton();
    });
  });

  describe('For completed workshops to a program manager organizer', () => {
    beforeEach(() => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .returns('viewHref');

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          permission={new Permission([ProgramManager])}
          showSurveyUrl={true}
        />,
        {context}
      );
    });

    it('Has 1 button', () => {
      expect(findButtons()).to.have.length(1);
    });

    it('Has a view workshop button', () => {
      verifyViewWorkshopButton();
    });
  });

  describe('For completed workshops to a facilitator', () => {
    beforeEach(() => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .returns('viewHref');

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          permission={new Permission(Facilitator)}
          showSurveyUrl={true}
        />,
        {context}
      );
    });

    it('Has 1 button', () => {
      expect(findButtons()).to.have.length(1);
    });

    it('Has a view workshop button', () => {
      verifyViewWorkshopButton();
    });
  });

  describe('For a local summer workshop in 2017 or earlier', () => {
    it('Renders the correct survey results URL', () => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .returns('viewHref');
      mockRouter
        .expects('createHref')
        .withExactArgs('/local_summer_workshop_survey_results/123')
        .returns('surveyResultsHref');

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          showSurveyUrl={true}
          subject="5-day Summer"
          date="2017-06-04T09:00:00.000Z"
        />,
        {context}
      );
    });
  });

  describe('For a local summer workshop in 2018', () => {
    it('Renders the correct survey results URL', () => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .returns('viewHref');
      mockRouter
        .expects('createHref')
        .withExactArgs('/daily_survey_results/123')
        .returns('surveyResultsHref');

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          showSurveyUrl={true}
          subject="5-day Summer"
          date="2018-06-04T09:00:00.000Z"
        />,
        {context}
      );
    });
  });

  describe('For a local summer workshop in 2020 or later', () => {
    it('Renders the correct survey results URL', () => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .returns('viewHref');
      mockRouter
        .expects('createHref')
        .withExactArgs('/workshop_daily_survey_results/123')
        .returns('surveyResultsHref');

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          showSurveyUrl={true}
          subject="5-day Summer"
          date="2020-06-04T09:00:00.000Z"
        />,
        {context}
      );
    });
  });
});
