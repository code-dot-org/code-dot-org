import { assert } from '../../../util/configuredChai';
import sinon from 'sinon';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import reducer, {
  loadClassroomList,
  setClassroomList,
  failedLoad,
  importClassroomStarted,
} from '@cdo/apps/templates/teacherDashboard/oauthClassroomRedux';

describe('googleClassroomRedux', () => {
  const initialState = reducer(undefined, {});

  describe('loadClassroomList', () => {
    it('loads the classroom list from the API', finish => {
      const data = {
        courses: [{id: "6949959535", section: "123", name: "Sample class", enrollment_code: "gc12wb"}]
      };

      const xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = request => {
        setTimeout(() => {
          const mockResponse = JSON.stringify(data);
          request.respond(200, {'Content-Type': 'application/json'}, mockResponse);

          assert.deepEqual([setClassroomList(data.courses)], store.getActions());
          finish();
        }, 0);
      };

      const mockStore = configureStore([thunk]);
      const store = mockStore({});

      store.dispatch(loadClassroomList());
    });

    it('fails to load the classroom list from the API', finish => {
      const failureStatus = 403;
      const failureMessage = 'Sample error message';

      const xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = request => {
        setTimeout(() => {
          const mockResponse = JSON.stringify({error: failureMessage});
          request.respond(failureStatus, {'Content-Type': 'application/json'}, mockResponse);

          assert.deepEqual([failedLoad(failureStatus, failureMessage)], store.getActions());
          finish();
        }, 0);
      };

      const mockStore = configureStore([thunk]);
      const store = mockStore({});

      store.dispatch(loadClassroomList());
    });
  });

  describe('importClassroomStarted', () => {
    it('starting import sets the list of classrooms to null', () => {
      const state = reducer(initialState, setClassroomList(['fake classrooms']));
      assert.deepEqual(state.classrooms, ['fake classrooms']);

      const nextState = reducer(state, importClassroomStarted());
      assert.equal(nextState.classrooms, null);
    });
  });
});
