import {assert, expect} from 'chai'; // eslint-disable-line no-restricted-imports
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {FormControl} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import '../workshopFactory';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';
import {createStore, combineReducers} from 'redux';
import {Factory} from 'rosie';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {WorkshopForm} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_form';
import Permission, {
  WorkshopAdmin,
  ProgramManager,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {COURSE_BUILD_YOUR_OWN} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';
import {Subjects} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import mapboxReducer from '@cdo/apps/redux/mapbox';

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
            today={getFakeToday(false)}
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
            today={getFakeToday(false)}
          />
        </MemoryRouter>
      </Provider>
    );

    const someControl = wrapper.find(FormControl);
    assert(someControl.exists());
  });

  it('creates and publishes new workshop form', () => {
    const server = sinon.fakeServer.create();
    server.respondWith('POST', '/api/v1/pd/workshops', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({}),
    ]);
    const onPublish = sinon.spy();

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            onSaved={onPublish}
            today={getFakeToday(false)}
            readOnly={false}
          />
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

    expect(onPublish).not.to.have.been.called;

    // Publish workshop
    const publishButton = wrapper.find('#workshop-form-save-btn').first();
    publishButton.simulate('click');

    server.respond();

    expect(onPublish).to.have.been.calledOnce;

    server.restore();
  });

  it('edits form and can save', () => {
    const workshop = Factory.build('virtual workshop');
    const server = sinon.fakeServer.create();
    server.respondWith('PATCH', `/api/v1/pd/workshops/${workshop.id}`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({}),
    ]);
    const onSave = sinon.spy();

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            onSaved={onSave}
            workshop={workshop}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const newCapacity = 40;
    const capacityField = wrapper.find('#capacity').first();
    capacityField.simulate('change', {
      target: {name: 'capacity', value: newCapacity},
    });

    expect(onSave).not.to.have.been.called;

    // Save workshop
    const saveButton = wrapper.find('#workshop-form-save-btn').first();
    saveButton.simulate('click');

    server.respond();

    expect(onSave).to.have.been.calledOnce;
    expect(wrapper.find('WorkshopForm').first().state().capacity).to.equal(
      newCapacity
    );

    server.restore();
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

  it('CSF, CSD, CSP, CSA, and Facilitator courses show standard workshop type options', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    [
      'CS Fundamentals',
      'CS Discoveries',
      'CS Principles',
      'Computer Science A',
      'Facilitator',
    ].forEach(courseName => {
      const courseField = wrapper.find('#course').first();
      courseField.simulate('change', {
        target: {name: 'course', value: courseName},
      });

      assert(wrapper.find('#funded').exists());
      assert(wrapper.find('#virtual').exists());
      assert(wrapper.find('#suppress_email').exists());
    });
  });

  it('CSF course shows help link that displays help text', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const courseField = wrapper.find('#course').first();
    courseField.simulate('change', {
      target: {name: 'course', value: 'CS Fundamentals'},
    });

    assert(!wrapper.find('#helpTextDisplay').exists());

    const helpLink = wrapper.find('#helpLink').first();
    helpLink.simulate('click');

    assert(wrapper.find('#helpTextDisplay').exists());
  });

  it('shows correct CSP, CSD, and CSA subjects', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const courseField = wrapper.find('#course').first();

    ['CS Principles', 'CS Discoveries', 'Computer Science A'].forEach(
      courseName => {
        courseField.simulate('change', {
          target: {name: 'course', value: courseName},
        });

        const subjectOptions = wrapper
          .find('SubjectSelect')
          .first()
          .find('option')
          .map(option => option.props().value)
          .slice(1);

        expect(subjectOptions).to.deep.equal(Subjects[courseName]);
      }
    );
  });

  it('CSF course and Intro, Deep Dive, or Facilitator Weekend subject shows fee and map questions', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const courseField = wrapper.find('#course').first();
    courseField.simulate('change', {
      target: {name: 'course', value: 'CS Fundamentals'},
    });

    ['Intro', 'Deep Dive', 'Code.org Facilitator Weekend'].forEach(
      subjectName => {
        const subjectField = wrapper.find('#subject').first();
        subjectField.simulate('change', {
          target: {name: 'subject', value: subjectName},
        });

        assert(wrapper.find('#fee').exists());
        assert(wrapper.find('#on_map').exists());
      }
    );
  });

  it('CSF course and District subject shows virtual and reminder fields', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const courseField = wrapper.find('#course').first();
    courseField.simulate('change', {
      target: {name: 'course', value: 'CS Fundamentals'},
    });

    const subjectField = wrapper.find('#subject').first();
    subjectField.simulate('change', {
      target: {name: 'subject', value: 'District'},
    });

    assert(wrapper.find('#virtual').exists());
    assert(wrapper.find('#suppress_email').exists());
  });

  it('CSD, CSP, or CSA course with virtual subject locks virtual field to true', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const courseField = wrapper.find('#course').first();

    ['CS Principles', 'CS Discoveries', 'Computer Science A'].forEach(
      courseName => {
        courseField.simulate('change', {
          target: {name: 'course', value: courseName},
        });

        const subjectField = wrapper.find('#subject').first();

        // Selecting 'Virtual Workshop Kickoff' should make virtual field set to 'regional'
        // (a.k.a. 'Yes, this is a regional virtual workshop.') and be disabled.
        subjectField.simulate('change', {
          target: {name: 'subject', value: 'Virtual Workshop Kickoff'},
        });
        expect(wrapper.find('#virtual').first().props().value).to.equal(
          'regional'
        );
        assert(wrapper.find('#virtual').first().props().disabled);

        // Changing subject from 'Virtual Workshop Kickoff' should make virtual field enabled again.
        subjectField.simulate('change', {
          target: {name: 'subject', value: 'Academic Year Workshop 1'},
        });
        assert(!wrapper.find('#virtual').first().props().disabled);
      }
    );
  });

  it('CSD, CSP, or CSA course with Teacher Con or Facilitator Weekend subject locks reminder field to false, otherwise unlocked and true', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const courseField = wrapper.find('#course').first();

    ['CS Principles', 'CS Discoveries', 'Computer Science A'].forEach(
      courseName => {
        courseField.simulate('change', {
          target: {name: 'course', value: courseName},
        });

        const subjectField = wrapper.find('#subject').first();

        // Selecting 'Teacher Con' or 'Facilitator Weekend' should make reminder field true and be disabled,
        // otherwise make false and not disabled.
        // For this field, true = 'No, I will remind enrollees myself.' and false = 'Yes, send reminders on my behalf.'
        subjectField.simulate('change', {
          target: {name: 'subject', value: 'Code.org TeacherCon'},
        });
        assert(wrapper.find('#suppress_email').first().props().value);
        assert(wrapper.find('#suppress_email').first().props().disabled);

        subjectField.simulate('change', {
          target: {name: 'subject', value: 'Code.org Facilitator Weekend'},
        });
        assert(wrapper.find('#suppress_email').first().props().value);
        assert(wrapper.find('#suppress_email').first().props().disabled);

        // Changing subject from 'Virtual Workshop Kickoff' should make 'virtual' field enabled again
        subjectField.simulate('change', {
          target: {name: 'subject', value: 'Academic Year Workshop 1'},
        });
        assert(!wrapper.find('#suppress_email').first().props().value);
        assert(!wrapper.find('#suppress_email').first().props().disabled);
      }
    );
  });

  it('Admin/Counselor Workshop with any subject shows fields and locks reminder to true', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const courseField = wrapper.find('#course').first();
    courseField.simulate('change', {
      target: {name: 'course', value: 'Admin/Counselor Workshop'},
    });

    const subjectField = wrapper.find('#subject').first();
    subjectField.simulate('change', {
      target: {name: 'subject', value: 'Welcome'},
    });

    assert(wrapper.find('#virtual').exists());
    expect(wrapper.find('#virtual').first().props().value).to.equal(
      'in_person'
    );

    assert(wrapper.find('#suppress_email').exists());
    assert(wrapper.find('#suppress_email').first().props().value);
    assert(wrapper.find('#suppress_email').first().props().disabled);
  });

  it('selecting Build Your Own Workshop does not show subject, paid, or email fields', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );

    const courseField = wrapper.find('#course').first();
    courseField.simulate('change', {
      target: {name: 'course', value: COURSE_BUILD_YOUR_OWN},
    });

    expect(wrapper.find('#subject')).to.have.lengthOf(0);
    expect(wrapper.find('#funded')).to.have.lengthOf(0);
    expect(wrapper.find('#suppress_email')).to.have.lengthOf(0);
  });

  it('selecting Build Your Own Workshop shows pl topics', () => {
    const server = sinon.fakeServer.create();
    server.respondWith(
      'GET',
      '/course_offerings/self_paced_pl_course_offerings',
      [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify([
          {id: '123', display_name: 'myPlTestTopic'},
          {id: '234', display_name: 'mySecondTopic'},
        ]),
      ]
    );
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(false)}
            readOnly={false}
          />
        </MemoryRouter>
      </Provider>
    );
    server.respond();
    // Verify the topics dropdown doesn't show up until Build Your Own is selected
    expect(wrapper.find('#course_offerings')).to.have.lengthOf(0);
    const courseField = wrapper.find('#course').first();
    courseField.simulate('change', {
      target: {name: 'course', value: COURSE_BUILD_YOUR_OWN},
    });
    expect(wrapper.find('#course_offerings')).to.have.lengthOf(1);
    wrapper.find('#dropdownMenuButton').first().simulate('click');
    // A user can select either the label or checkbox, so we expect 2 for each here
    expect(wrapper.find({name: 'myPlTestTopic'})).to.have.lengthOf(2);
    expect(wrapper.find({name: 'mySecondTopic'})).to.have.lengthOf(2);
  });

  it('editing form as non-admin does not show organizer field', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([ProgramManager])}
            facilitatorCourses={[]}
            workshop={fakeWorkshop}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('OrganizerFormPart')).to.have.lengthOf(0);
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
            today={getFakeToday(false)}
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
            today={getFakeToday(false)}
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
            today={getFakeToday(false)}
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
            today={getFakeToday(false)}
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
            today={getFakeToday(false)}
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
            today={getFakeToday(true)}
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
            today={getFakeToday(true)}
          />
        </MemoryRouter>
      </Provider>
    );

    const virtualFormController = wrapper.find('#virtual').first();
    assert(!virtualFormController.props().disabled);
  });

  it('does not show module options when CSD and custom workshop subject are not selected', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(true)}
          />
        </MemoryRouter>
      </Provider>
    );
    const courseField = wrapper.find('#course').first();
    courseField.simulate('change', {
      target: {name: 'course', value: 'CS Principles'},
    });

    const subjectField = wrapper.find('#subject').first();
    subjectField.simulate('change', {
      target: {name: 'subject', value: 'Workshop For Returning Teachers'},
    });

    const moduleOptions = wrapper.find('#module').first();

    assert(!moduleOptions.exists());
  });

  it('shows module options when CSD and custom workshop subject are selected', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <WorkshopForm
            permission={new Permission([WorkshopAdmin])}
            facilitatorCourses={[]}
            today={getFakeToday(true)}
          />
        </MemoryRouter>
      </Provider>
    );
    const courseField = wrapper.find('#course').first();
    courseField.simulate('change', {
      target: {name: 'course', value: 'CS Discoveries'},
    });
    const subjectField = wrapper.find('#subject').first();
    subjectField.simulate('change', {
      target: {name: 'subject', value: 'Custom Workshop'},
    });

    const moduleOptions = wrapper.find('#module').first();
    assert(moduleOptions.exists());
  });
});
