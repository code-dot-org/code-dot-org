import { shallow } from 'enzyme';
import React from 'react';
import {Button} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import ConfirmationDialog from '@cdo/apps/code-studio/pd/components/confirmation_dialog';
import {WorkshopManagement} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_management';
import Permission, {
  Organizer,
  ProgramManager,
  Facilitator,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {WorkshopTypes} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

const defaultProps = {
  permission: new Permission(),
  course: 'CS Principles',
  workshopId: 123,
  viewUrl: 'viewUrl',
  date: '2017-07-01',
};

describe('WorkshopManagement', () => {
  const fakeRouter = {
    createHref() {},
    push() {},
  };
  const context = {
    router: fakeRouter,
  };
  const mockClickEvent = {
    preventDefault() {},
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
      b => b.children().first().text() === text
    );
    expect(filtered).toHaveLength(1);
    return filtered.first();
  };

  const verifyViewWorkshopButton = () => {
    const viewWorkshopButton = findButtonWithText('View Workshop');
    expect(viewWorkshopButton.props().href).toEqual('viewHref');

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
        subject: '5-day Summer',
      });
      expect(surveyUrl).toEqual('/workshop_daily_survey_results/123');
    });

    it('uses foorm results for Intro workshop past May 2020', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2020-05-08',
        subject: 'Intro',
      });
      expect(surveyUrl).toEqual('/workshop_daily_survey_results/123');
    });

    it('uses daily results for academic year workshop past August 2018', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2018-09-01',
        subject: 'Academic Year Workshop 1',
      });
      expect(surveyUrl).toEqual('/daily_survey_results/123');
    });

    it('uses survey results for academic year workshop before August 2018', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2018-07-01',
        subject: 'Academic Year Workshop 1',
      });
      expect(surveyUrl).toBeNull();
    });

    it('uses daily results for local summer in 2018', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2018-07-01',
        subject: WorkshopTypes.local_summer,
      });
      expect(surveyUrl).toEqual('/daily_survey_results/123');
    });

    it('uses daily results for teachercon in 2018', () => {
      const surveyUrl = getSurveyUrlForProps({
        date: '2018-07-01',
        subject: WorkshopTypes.teachercon,
      });
      expect(surveyUrl).toEqual('/daily_survey_results/123');
    });

    it('uses organizer results for organizers', () => {
      const organizerPermission = new Permission([Organizer]);
      const surveyUrl = getSurveyUrlForProps({permission: organizerPermission});
      expect(surveyUrl).toBeNull();
    });

    it('uses organizer results for program managers', () => {
      const programManagerPermission = new Permission([ProgramManager]);
      const surveyUrl = getSurveyUrlForProps({
        permission: programManagerPermission,
      });
      expect(surveyUrl).toBeNull();
    });

    it('uses survey_results by default', () => {
      const surveyUrl = getSurveyUrlForProps();
      expect(surveyUrl).toBeNull();
    });
  });

  describe('For not-started workshops', () => {
    let deleteStub;

    beforeEach(() => {
      deleteStub = jest.fn();
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .mockReturnValue('viewHref')
        .atLeast(1);
      mockRouter
        .expects('createHref')
        .withExactArgs('editUrl')
        .mockReturnValue('editHref')
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
      expect(deleteStub).not.toHaveBeenCalled();
    });

    it('Has 3 buttons', () => {
      expect(findButtons()).toHaveLength(3);
    });

    it('Has a view workshop button', () => {
      verifyViewWorkshopButton();
    });

    it('Has an edit button', () => {
      const editButton = findButtonWithText('Edit');
      expect(editButton.props().href).toEqual('editHref');

      mockRouter.expects('push').withExactArgs('editUrl');
      editButton.simulate('click', mockClickEvent);
    });

    it('Has a delete button', () => {
      const deleteButton = findButtonWithText('Delete');

      deleteButton.simulate('click', mockClickEvent);
      expect(workshopManagement.state().showDeleteConfirmation).toBe(true);
    });

    describe('Delete confirmation', () => {
      let deleteConfirmationDialog;
      beforeEach(() => {
        workshopManagement.setState({showDeleteConfirmation: true});
        deleteConfirmationDialog = workshopManagement.find(ConfirmationDialog);
      });

      it('Is displayed when showDeleteConfirmation is set', () => {
        expect(deleteConfirmationDialog).toHaveLength(1);
        expect(deleteConfirmationDialog.props().onOk).toEqual(workshopManagement.instance().handleDeleteConfirmed);
        expect(deleteConfirmationDialog.props().onCancel).toEqual(workshopManagement.instance().handleDeleteCanceled);
      });

      it('Goes away when canceled', () => {
        deleteConfirmationDialog.props().onCancel();
        expect(workshopManagement.state().showDeleteConfirmation).toBe(false);
      });

      it('Calls the supplied onDelete func when confirmed', () => {
        deleteConfirmationDialog.props().onOk();
        expect(deleteStub).toHaveBeenCalledWith(123);
        deleteStub.mockReset();
      });
    });
  });

  describe('For in-progress workshops', () => {
    beforeEach(() => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .mockReturnValue('viewHref')
        .atLeast(1);

      workshopManagement = shallow(<WorkshopManagement {...defaultProps} />, {
        context,
      });
    });

    it('Has only a view workshop button', () => {
      expect(findButtons()).toHaveLength(1);
      verifyViewWorkshopButton();
    });
  });

  describe('For completed workshops to a workshop organizer', () => {
    beforeEach(() => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .mockReturnValue('viewHref');

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
      expect(findButtons()).toHaveLength(1);
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
        .mockReturnValue('viewHref');

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
      expect(findButtons()).toHaveLength(1);
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
        .mockReturnValue('viewHref');

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
      expect(findButtons()).toHaveLength(1);
    });

    it('Has a view workshop button', () => {
      verifyViewWorkshopButton();
    });
  });

  describe('For a local summer workshop in 2018', () => {
    it('Renders the correct survey results URL', () => {
      mockRouter
        .expects('createHref')
        .withExactArgs('viewUrl')
        .mockReturnValue('viewHref');
      mockRouter
        .expects('createHref')
        .withExactArgs('/daily_survey_results/123')
        .mockReturnValue('surveyResultsHref');

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
        .mockReturnValue('viewHref');
      mockRouter
        .expects('createHref')
        .withExactArgs('/workshop_daily_survey_results/123')
        .mockReturnValue('surveyResultsHref');

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
