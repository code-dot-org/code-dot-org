import React from 'react';
import {mount} from 'enzyme';
// import {expect} from 'chai';
// import Permission, {
//   WorkshopAdmin,
// } from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
// import sinon from 'sinon';
// import jQuery from 'jquery';
import NewWorkshop from '@cdo/apps/code-studio/pd/workshop_dashboard/new_workshop';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';
import mapboxReducer from '@cdo/apps/redux/mapbox';
//import {registerReducers} from '@cdo/apps/redux';
import {createStore, combineReducers} from 'redux';
import {setPermission} from '@cdo/apps/code-studio/pd/workshop_dashboard/reducers';

describe('WorkshopForm test', () => {
  let store;

  beforeEach(() => {
    store = createStore(
      combineReducers({
        mapbox: mapboxReducer,
      })
    );
    store.dispatch(setPermission(['workshop_admin']));
  });

  it('creates new form and publishes', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <NewWorkshop />
        </MemoryRouter>
      </Provider>
    );

    // Set fields required for publishing
    const locationField = wrapper.find('#location_name').first();
    locationField.simulate('change', {
      target: {name: 'location_name', value: 'Test location'},
    });

    const capacityField = wrapper.find('#capacity').first();
    capacityField.simulate('change', {
      target: {name: 'capacity', value: 10},
    });

    const courseField = wrapper.find('#course').first();
    courseField.simulate('change', {
      target: {name: 'course', value: 'Admin/Counselor Workshop'},
    });

    const subjectField = wrapper.find('#subject').first();
    subjectField.simulate('change', {
      target: {name: 'subject', value: 'SLP Intro'},
    });

    // Publish workshop
    const publishButton = wrapper.find('#workshop-form-save-btn').first();
    publishButton.simulate('click');
  });
});
