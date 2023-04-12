import React from 'react';
import {mount} from 'enzyme';
import {assert} from 'chai';
import {Factory} from 'rosie';
import {FormControl} from 'react-bootstrap';
import Permission, {
  WorkshopAdmin,
  ProgramManager
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {WorkshopForm} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_form';
import '../workshopFactory';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';
import mapboxReducer from '@cdo/apps/redux/mapbox';
import {createStore, combineReducers} from 'redux';

describe('WorkshopForm test', () => {
  let fakeWorkshop, store;

  beforeEach(() => {
    fakeWorkshop = Factory.build('workshop');
    store = createStore(
      combineReducers({
        mapbox: mapboxReducer
      })
    );
  });

  it('renders csf intro workshop', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            workshop={fakeWorkshop}
            onSaved={() => {}}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const someControl = wrapper.find(FormControl);
    assert(someControl.exists());
  });

  it('renders csp summer workshop', () => {
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

  it('virtual field disabled for non-ws-admin for CSP/CSA workshop within a month of starting', () => {
    const cspSummerWorkshopStartSoon = Factory.build(
      'csp summer workshop starting within month'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={cspSummerWorkshopStartSoon}
            onSaved={() => {}}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(virtualFormController.props().disabled);
  });

  it('virtual field enabled for ws-admin for CSP/CSA workshop within a month of starting', () => {
    const cspSummerWorkshopStartSoon = Factory.build(
      'csp summer workshop starting within month'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            workshop={cspSummerWorkshopStartSoon}
            onSaved={() => {}}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(!virtualFormController.props().disabled);
  });

  it('virtual field enabled for non-ws-admin for non-CSP/CSA workshop within a month of starting', () => {
    const csdSummerWorkshopStartSoon = Factory.build(
      'csd summer workshop starting within month'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={csdSummerWorkshopStartSoon}
            onSaved={() => {}}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(!virtualFormController.props().disabled);
  });

  it('virtual field enabled for non-ws-admin for CSP/CSA workshop over a month from starting', () => {
    const cspSummerWorkshopStartOverMonth = Factory.build(
      'csp summer workshop starting in over a month'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={cspSummerWorkshopStartOverMonth}
            onSaved={() => {}}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(!virtualFormController.props().disabled);
  });
});
