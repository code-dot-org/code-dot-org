import React from 'react';
import {shallow, mount} from 'enzyme';
import {assert} from 'chai';
import {Factory} from 'rosie';
import {FormControl} from 'react-bootstrap';
import Permission, {
  WorkshopAdmin
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {WorkshopForm} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_form';
import '../workshopFactory';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';
import mapboxReducer from '@cdo/apps/redux/mapbox';
import {createStore, combineReducers} from 'redux';

describe('WorkshopForm test', () => {
  let fakeWorkshop;

  beforeEach(() => {
    fakeWorkshop = Factory.build('workshop');
  });

  it('renders csf intro workshop ', () => {
    const wrapper = shallow(
      <WorkshopForm
        permission={new Permission()}
        facilitatorCourses={[]}
        workshop={fakeWorkshop}
        onSaved={() => {}}
        readOnly={false}
      />,
      {context: {router: {}}}
    );

    const someControl = wrapper.find(FormControl);
    assert(someControl.exists());
  });

  it('renders csp summer workshop', () => {
    const store = createStore(
      combineReducers({
        mapbox: mapboxReducer
      })
    );

    const cspSummerWorkshop = Factory.build('csp summer workshop');
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            workshop={cspSummerWorkshop}
            onSaved={() => {}}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const someControl = wrapper.find(FormControl);
    assert(someControl.exists());
  });
});
