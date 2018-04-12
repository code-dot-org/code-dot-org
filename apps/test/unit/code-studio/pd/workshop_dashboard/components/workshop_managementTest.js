import {WorkshopManagement} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_management';
import ConfirmationDialog from '@cdo/apps/code-studio/pd/workshop_dashboard/components/confirmation_dialog';
import {Button} from 'react-bootstrap';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Permission, {
  Organizer,
  ProgramManager,
  Facilitator
}
from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';

const defaultProps = {
  permission: new Permission(),
  workshopId: 123,
  viewUrl: "viewUrl"
};

describe("WorkshopManagement", () => {
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
    const filtered = findButtons().filterWhere(b => b.children().first().text() === text);
    expect(filtered).to.have.length(1);
    return filtered.first();
  };

  const verifyViewWorkshopButton = () => {
    const viewWorkshopButton = findButtonWithText("View Workshop");
    expect(viewWorkshopButton.props().href).to.eql("viewHref");

    mockRouter.expects("push").withExactArgs("viewUrl");
    viewWorkshopButton.simulate('click', mockClickEvent);
  };

  describe("For not-started workshops", () => {
    let deleteStub;

    beforeEach(() => {
      deleteStub = sinon.spy();
      mockRouter.expects("createHref").withExactArgs("viewUrl").returns("viewHref").atLeast(1);
      mockRouter.expects("createHref").withExactArgs("editUrl").returns("editHref").atLeast(1);

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          editUrl = "editUrl"
          onDelete = {deleteStub}
        />, {context}
      );
    });

    afterEach(() => {
      expect(deleteStub.notCalled).to.be.true;
    });

    it("Has 3 buttons", () => {
      expect(findButtons()).to.have.length(3);
    });

    it("Has a view workshop button", () => {
      verifyViewWorkshopButton();
    });

    it("Has an edit button", () => {
      const editButton = findButtonWithText("Edit");
      expect(editButton.props().href).to.eql("editHref");

      mockRouter.expects("push").withExactArgs("editUrl");
      editButton.simulate('click', mockClickEvent);
    });

    it("Has a delete button", () => {
      const deleteButton = findButtonWithText("Delete");

      deleteButton.simulate('click', mockClickEvent);
      expect(workshopManagement.state().showDeleteConfirmation).to.be.true;
    });

    describe("Delete confirmation", () => {
      let deleteConfirmationDialog;
      beforeEach(() => {
        workshopManagement.setState({showDeleteConfirmation: true});
        deleteConfirmationDialog = workshopManagement.find(ConfirmationDialog);
      });

      it("Is displayed when showDeleteConfirmation is set", () => {
        expect(deleteConfirmationDialog).to.have.length(1);
        expect(deleteConfirmationDialog.props().onOk).to.eql(
          workshopManagement.instance().handleDeleteConfirmed
        );
        expect(deleteConfirmationDialog.props().onCancel).to.eql(
          workshopManagement.instance().handleDeleteCanceled
        );
      });

      it("Goes away when canceled", () => {
        deleteConfirmationDialog.props().onCancel();
        expect(workshopManagement.state().showDeleteConfirmation).to.be.false;
      });

      it("Calls the supplied onDelete func when confirmed", () => {
        deleteConfirmationDialog.props().onOk();
        expect(deleteStub.withArgs(123).calledOnce).to.be.true;
        deleteStub.reset();
      });
    });
  });

  describe("For in-progress workshops", () => {
    beforeEach(() => {
      mockRouter.expects("createHref").withExactArgs("viewUrl").returns("viewHref").atLeast(1);

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
        />,
        {context}
      );
    });

    it("Has only a view workshop button", () => {
      expect(findButtons()).to.have.length(1);
      verifyViewWorkshopButton();
    });
  });

  describe("For completed workshops to a workshop organizer", () => {
    beforeEach(() => {
      mockRouter.expects("createHref").withExactArgs("viewUrl").returns("viewHref");
      mockRouter.expects("createHref").withExactArgs("/organizer_survey_results/123").returns("organizerResultsHref");

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          permission={new Permission([Organizer])}
          showSurveyUrl={true}
        />,
        {context}
      );
    });

    it("Has 2 buttons", () => {
      expect(findButtons()).to.have.length(2);
    });

    it("Has a view workshop button", () => {
      verifyViewWorkshopButton();
    });

    it("Has a View Survey Results button", () => {
      const surveyButton = findButtonWithText("View Survey Results");
      expect(surveyButton.props().href).to.eql("organizerResultsHref");

      mockRouter.expects("push").withExactArgs("/organizer_survey_results/123");
      surveyButton.simulate('click', mockClickEvent);
    });
  });

  describe("For completed workshops to a program manager organizer", () => {
    beforeEach(() => {
      mockRouter.expects("createHref").withExactArgs("viewUrl").returns("viewHref");
      mockRouter.expects("createHref").withExactArgs("/organizer_survey_results/123").returns("organizerResultsHref");

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          permission={new Permission([ProgramManager])}
          showSurveyUrl={true}
        />,
        {context}
      );
    });

    it("Has 2 buttons", () => {
      expect(findButtons()).to.have.length(2);
    });

    it("Has a view workshop button", () => {
      verifyViewWorkshopButton();
    });

    it("Has a View Survey Results button", () => {
      const surveyButton = findButtonWithText("View Survey Results");
      expect(surveyButton.props().href).to.eql("organizerResultsHref");

      mockRouter.expects("push").withExactArgs("/organizer_survey_results/123");
      surveyButton.simulate('click', mockClickEvent);
    });
  });

  describe("For completed workshops to a facilitator", () => {
    beforeEach(() => {
      mockRouter.expects("createHref").withExactArgs("viewUrl").returns("viewHref");
      mockRouter.expects("createHref").withExactArgs("/survey_results/123").returns("facilitatorResultsHref");

      workshopManagement = shallow(
        <WorkshopManagement
          {...defaultProps}
          permission={new Permission(Facilitator)}
          showSurveyUrl={true}
        />,
        {context}
      );
    });

    it("Has 2 buttons", () => {
      expect(findButtons()).to.have.length(2);
    });

    it("Has a view workshop button", () => {
      verifyViewWorkshopButton();
    });

    it("Has a View Survey Results button", () => {
      const surveyButton = findButtonWithText("View Survey Results");
      expect(surveyButton.props().href).to.eql("facilitatorResultsHref");

      mockRouter.expects("push").withExactArgs("/survey_results/123");
      surveyButton.simulate('click', mockClickEvent);
    });
  });
});
