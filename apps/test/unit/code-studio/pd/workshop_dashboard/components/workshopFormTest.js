import React from 'react';
import {mount} from 'enzyme';
import {assert, expect} from 'chai';
import {Factory} from 'rosie';
import {FormControl} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import Permission, {
  WorkshopAdmin,
  ProgramManager,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {WorkshopForm} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_form';
import '../workshopFactory';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';
import mapboxReducer from '@cdo/apps/redux/mapbox';
import {createStore, combineReducers} from 'redux';

// Returns a fake "today" for the stubbed out "getToday" method in workshop_form.jsx.
// isEndOfYear:
//  - true -> December 30th, 2016
//  - false -> returns July 1st, 2016
// as per workshopFactory.js
const getFakeToday = isEndOfYear => {
  return isEndOfYear ? new Date(2016, 12, 30) : new Date(2016, 6, 1);
};

describe('WorkshopForm test', () => {
  let fakeWorkshop, store;

  beforeEach(() => {
    fakeWorkshop = Factory.build('workshop');
    store = createStore(
      combineReducers({
        mapbox: mapboxReducer,
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
            today={getFakeToday(false)}
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
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const someControl = wrapper.find(FormControl);
    assert(someControl.exists());
  });

  it('inputs disabled in readonly', () => {
    const workshop = Factory.build('workshop');
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={workshop}
            readOnly={true}
          />
        </MemoryRouter>
      </Provider>
    );

    ['input', 'select', 'Radio', 'FormControl'].forEach(elementType => {
      wrapper
        .find(elementType)
        .forEach(element => assert(element.props().disabled));
    });
  });

  it('workshop with one session shows add session button in row', () => {
    const workshop = Factory.build('workshop');
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            workshop={workshop}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const addIcon = wrapper
      .find('SessionListFormPart')
      .find('SessionFormPart')
      .find('i')
      .slice(-1);
    expect(addIcon.props().className.trim()).to.equal('fa fa-plus');
  });

  it('workshop with 2+ sessions shows remove session button in each row and add session in last row', () => {
    const workshop = Factory.build('workshop multiple sessions');
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            workshop={workshop}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const icons = wrapper
      .find('SessionListFormPart')
      .find('SessionFormPart')
      .find('Col')
      .slice(-1)
      .find('i')
      .map(icon => icon.props().className.trim());

    // There is one remove icon per row and then the final row has an add icon followed by a remove icon
    const addIcon = icons[icons.length - 2];
    const removeIcons = [
      ...icons.slice(0, icons.length - 2),
      ...icons.slice(-1),
    ];

    removeIcons.forEach(ri => {
      expect(ri).to.equal('fa fa-minus');
    });
    expect(addIcon).to.equal('fa fa-plus');
  });

  it('virtual field disabled for non-ws-admin for CSP/CSA summer workshop within a month of starting', () => {
    const cspSummerWorkshopStartSoon = Factory.build(
      'csp summer workshop starting within a month'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={cspSummerWorkshopStartSoon}
            onSaved={() => {}}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(virtualFormController.props().disabled);
  });

  it('virtual field enabled for ws-admin for CSP/CSA summer workshop within a month of starting', () => {
    const cspSummerWorkshopStartSoon = Factory.build(
      'csp summer workshop starting within a month'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            workshop={cspSummerWorkshopStartSoon}
            onSaved={() => {}}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(!virtualFormController.props().disabled);
  });

  it('virtual field enabled for non-ws-admin for non-CSP/CSA summer workshop within a month of starting', () => {
    const csdSummerWorkshopStartSoon = Factory.build(
      'csd summer workshop starting within a month'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={csdSummerWorkshopStartSoon}
            onSaved={() => {}}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(!virtualFormController.props().disabled);
  });

  it('virtual field enabled for non-ws-admin for CSP/CSA non-summer workshop within a month of starting', () => {
    const cspAYW1WorkshopStartSoon = Factory.build(
      'csp ayw1 workshop starting within a month'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={cspAYW1WorkshopStartSoon}
            onSaved={() => {}}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(!virtualFormController.props().disabled);
  });

  it('virtual field enabled for non-ws-admin for CSP/CSA summer workshop over a month from starting', () => {
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
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(!virtualFormController.props().disabled);
  });

  it('virtual field disabled for non-ws-admin for CSP/CSA summer workshop within a month of starting and close to year turnover', () => {
    const cspSummerWorkshopStartSoon = Factory.build(
      'csp summer workshop starting within month of endOfYearFakeToday'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={cspSummerWorkshopStartSoon}
            onSaved={() => {}}
            today={getFakeToday(true)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(virtualFormController.props().disabled);
  });

  it('virtual field enabled for non-ws-admin for CSP/CSA summer workshop over a month from starting and close to year turnover', () => {
    const cspSummerWorkshopStartOverMonth = Factory.build(
      'csp summer workshop starting in over a month from endOfYearFakeToday'
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={cspSummerWorkshopStartOverMonth}
            onSaved={() => {}}
            today={getFakeToday(true)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(!virtualFormController.props().disabled);
  });
});
