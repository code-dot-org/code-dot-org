import {Button as MuiButton} from '@mui/material';
import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {act} from 'react-dom/test-utils';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {UnconnectedRosterDialog as RosterDialog} from '@cdo/apps/templates/teacherDashboard/RosterDialog';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import locale from '@cdo/locale';

import {assert, expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const failedLoadError = {
  status: 404,
  message: 'import failed',
};

const fakeClassroom = {
  id: '2',
  name: 'myClassroom',
  section: '1st Pd',
  enrollment_code: '12345',
};

const archivedClassroom = {
  id: '3',
  name: 'archivedClassroom',
  section: '1st Pd',
  enrollment_code: '12345',
  course_state: 'ARCHIVED',
};

describe('RosterDialog', () => {
  it('displays the loadError when there is one', () => {
    const wrapper = shallow(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[]}
        loadError={failedLoadError}
        rosterProvider={OAuthSectionTypes.google_classroom}
      />
    );
    expect(wrapper.html()).contains(locale.authorizeGoogleClassroomsText());
  });

  it('renders a ClassLink title and the server-sent error message', () => {
    const wrapper = shallow(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[]}
        loadError={{status: 403, message: 'district message from server'}}
        rosterProvider={OAuthSectionTypes.classlink}
      />
    );
    const html = wrapper.html();
    expect(html).contains(locale.selectClasslinkSection());
    expect(html).contains('district message from server');
  });

  it('falls back to the generic ClassLink message when the error carries none', () => {
    const wrapper = shallow(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[]}
        loadError={{status: 502, message: ''}}
        rosterProvider={OAuthSectionTypes.classlink}
      />
    );
    // Substring avoids the apostrophe, which wrapper.html() HTML-escapes.
    expect(wrapper.html()).contains(
      'getting roster information from ClassLink'
    );
  });

  it('sends cancel analytics event when dialog is canceled', () => {
    const wrapper = shallow(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[]}
        loadError={failedLoadError}
        rosterProvider={OAuthSectionTypes.google_classroom}
      />
    );
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

    wrapper
      .find(MuiButton)
      .filterWhere(button => button.prop('id') === 'roster-cancel-button')
      .simulate('click');
    assert(analyticsSpy.calledOnce);
    assert.equal(analyticsSpy.getCall(0).firstArg, 'Section Setup Cancelled');
    assert.deepEqual(analyticsSpy.getCall(0).args[1], {
      oauthSource: OAuthSectionTypes.google_classroom,
    });

    analyticsSpy.restore();
  });

  it('displays classroom options when no loadError and classrooms exist', () => {
    const wrapper = mount(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[fakeClassroom]}
        loadError={null}
        rosterProvider={OAuthSectionTypes.google_classroom}
      />
    );
    expect(wrapper.text()).contains('myClassroom');
    expect(wrapper.text()).contains('12345');
    expect(wrapper.text()).not.contains('ARCHIVED');
  });

  it('sends section set up completed analytics event when import is called', async () => {
    const rosterDialog = mount(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[fakeClassroom]}
        loadError={null}
        rosterProvider={OAuthSectionTypes.google_classroom}
      />
    );
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

    await act(async () => {
      rosterDialog.instance().setState({selectedId: '2'});
    });
    rosterDialog.update();
    await act(async () => {
      rosterDialog.instance().importClassroom();
    });
    assert(analyticsSpy.calledOnce);
    assert.equal(analyticsSpy.getCall(0).firstArg, 'Section Setup Completed');
    assert.deepEqual(analyticsSpy.getCall(0).args[1], {
      oauthSource: OAuthSectionTypes.google_classroom,
    });

    analyticsSpy.restore();
  });

  it('displays import and redirect button to new section setup', () => {
    const wrapper = mount(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[fakeClassroom]}
        loadError={null}
        rosterProvider={OAuthSectionTypes.google_classroom}
        userId={90}
      />
    );
    expect(
      wrapper
        .find(MuiButton)
        .filterWhere(
          button => button.prop('id') === 'import-button-and-redirect'
        )
    ).to.have.lengthOf(1);
  });

  it('sends completed analytics event with the created section id after import succeeds', async () => {
    const rosterDialog = shallow(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[fakeClassroom]}
        loadError={null}
        rosterProvider={OAuthSectionTypes.google_classroom}
      />
    );
    rosterDialog.instance().setState({selectedId: '2'});
    rosterDialog.instance().redirectToEditSectionPage = jest.fn();

    const getStub = sinon.stub(HttpClient, 'get').resolves({
      json: () => Promise.resolve({id: 42}),
    });
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

    await rosterDialog.instance().handleRedirect();

    assert(analyticsSpy.calledOnce);
    assert.equal(analyticsSpy.getCall(0).firstArg, 'Section Setup Completed');
    assert.deepEqual(analyticsSpy.getCall(0).args[1], {
      oauthSource: OAuthSectionTypes.google_classroom,
      sectionId: 42,
    });
    expect(
      rosterDialog.instance().redirectToEditSectionPage.mock.calls
    ).to.deep.equal([[42]]);

    analyticsSpy.restore();
    getStub.restore();
  });

  it('should dispatch handleImportFailure when the import request fails', async () => {
    const handleImportFailureMock = jest.fn();
    const failedResponse = {
      status: 403,
      statusText: 'Forbidden',
      json: () => Promise.resolve({error: 'nope'}),
    };
    const getStub = sinon
      .stub(HttpClient, 'get')
      .rejects(new NetworkError('403 Forbidden', failedResponse));

    const rosterDialog = shallow(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        handleImportFailure={handleImportFailureMock}
        isOpen={true}
        classrooms={[
          {
            id: '2',
            name: 'Test',
          },
        ]}
        loadError={failedLoadError}
        rosterProvider={OAuthSectionTypes.google_classroom}
      />
    );

    rosterDialog.instance().setState({selectedId: '2'});
    let rejected = false;
    await rosterDialog
      .instance()
      .handleRedirect()
      .catch(() => {
        rejected = true;
      });

    expect(rejected).to.equal(true);
    expect(handleImportFailureMock.mock.calls.length).to.equal(1);
    expect(handleImportFailureMock.mock.calls[0][0]).to.deep.equal({
      status: 403,
      message: 'nope',
    });

    getStub.restore();
  });

  it('displays Clever 404 message when Clever classrooms returns 404', () => {
    const wrapper = shallow(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[]}
        loadError={{status: 404, message: 'Not Found'}}
        rosterProvider={OAuthSectionTypes.clever}
      />
    );
    expect(wrapper.html()).contains(locale.cleverClassroomsNotFound());
  });

  it('displays generic error for non-404 Clever failures', () => {
    const wrapper = shallow(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[]}
        loadError={{status: 500, message: 'Internal Server Error'}}
        rosterProvider={OAuthSectionTypes.clever}
      />
    );
    expect(wrapper.html()).not.contains(locale.cleverClassroomsNotFound());
    expect(wrapper.html()).contains(
      locale.errorLoadingRosteredSections({type: locale.loginTypeClever()})
    );
  });

  it('should label archived sections as archived ', () => {
    const wrapper = mount(
      <RosterDialog
        handleImport={() => {}}
        handleCancel={() => {}}
        isOpen={true}
        classrooms={[archivedClassroom]}
        loadError={null}
        rosterProvider={OAuthSectionTypes.google_classroom}
        userId={90}
      />
    );
    expect(wrapper.text()).contains('ARCHIVED');
  });
});
