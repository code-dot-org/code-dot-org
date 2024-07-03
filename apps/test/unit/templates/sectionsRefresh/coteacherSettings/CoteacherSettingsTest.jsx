import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import CoteacherSettings from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/CoteacherSettings';
import i18n from '@cdo/locale';



const testPrimaryTeacher = {
  name: 'T-rex',
  email: 'tyrannosaurus.rex@code.org',
};

const testSectionInstructors = [
  {
    instructorName: 'T-rex',
    instructorEmail: 'tyrannosaurus.rex@code.org',
    status: 'active',
    id: 1,
  },
  {
    instructorName: 'Allosaurus',
    instructorEmail: 'allosaurus@code.org',
    status: 'active',
    id: 2,
  },
  {
    instructorEmail: 'brachiosaurus@code.org',
    status: 'invited',
    id: 3,
  },
];

describe('CoteacherSettings', () => {
  it('renders count of existing coteachers', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={[]}
        primaryTeacher={testPrimaryTeacher}
      />
    );
    const addCoteacher = wrapper.find('AddCoteacher').dive();
    expect(addCoteacher.find('Figcaption')).toHaveLength(1);
    expect(addCoteacher.find('Figcaption').props().children).toContain('2/5 co-teachers added');
  });
  it('renders count if current sectionInstructors is null', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={null}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={[]}
        primaryTeacher={null}
      />
    );
    const addCoteacher = wrapper.find('AddCoteacher').dive();
    expect(addCoteacher.find('Figcaption')).toHaveLength(1);
    expect(addCoteacher.find('Figcaption').props().children).toContain('0/5 co-teachers added');
  });
  it('renders count of existing coteachers and added', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={['coelophysis@code.org']}
        primaryTeacher={testPrimaryTeacher}
      />
    );
    const addCoteacher = wrapper.find('AddCoteacher').dive();
    expect(addCoteacher.find('Figcaption')).toHaveLength(1);
    expect(addCoteacher.find('Figcaption').props().children).toContain('3/5 co-teachers added');
  });
  it('shows coteacher table and sorts instructors', () => {
    const wrapper = mount(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={['coelophysis@code.org']}
        primaryTeacher={testPrimaryTeacher}
      />
    );
    expect(wrapper.find('tr')).toHaveLength(3);
    const cells = wrapper.find('td');
    expect(cells).toHaveLength(9);
    expect(cells.at(0).text()).toContain('coelophysis@code.org');
    expect(cells.at(1).text()).toContain('PENDING');
    expect(cells.at(3).text()).not.toContain('Brachiosaurus');
    expect(cells.at(3).text()).toContain('brachiosaurus@code.org');
    expect(cells.at(4).text()).toContain('PENDING');
    expect(cells.at(6).text()).toContain('Allosaurus');
    expect(cells.at(6).text()).toContain('allosaurus@code.org');
    expect(cells.at(7).text()).toContain('ACCEPTED');
  });
  it('renders LTI instructions for co-teacher and disables remove button if disabled', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={[]}
        primaryTeacher={testPrimaryTeacher}
        disabled
      />
    );
    const addCoteacher = wrapper.find('div').first().childAt(0);
    expect(addCoteacher.text()).toBe(i18n.coteacherLtiAddInfo());

    const cells = wrapper.find('CoteacherTable').dive().find('td');
    const button = cells.find('button');
    expect(button).toHaveLength(0);
  });
  it('clicking remove opens dialog', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={['coelophysis@code.org']}
        primaryTeacher={testPrimaryTeacher}
      />
    );

    let dialog = wrapper.find('RemoveCoteacherDialog').dive();
    expect(Object.keys(dialog)).toHaveLength(0);
    const table = wrapper.find('CoteacherTable').dive();
    const cells = table.find('td');
    expect(cells).toHaveLength(9);
    const button = cells.at(2).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    dialog = wrapper.find('RemoveCoteacherDialog').dive();

    expect(wrapper.find('RemoveCoteacherDialog').length).toBe(1);
    expect(dialog.find('Button')).toHaveLength(2);
    expect(dialog.find('StrongText').dive().text()).toContain('Remove coelophysis@code.org');
  });
  it('cancel remove does nothing', () => {
    let coteachersToAdd = ['coelophysis@code.org'];
    const setCoteachersToAdd = func =>
      (coteachersToAdd = func(coteachersToAdd));

    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={setCoteachersToAdd}
        coteachersToAdd={coteachersToAdd}
        primaryTeacher={testPrimaryTeacher}
      />
    );
    let dialog = wrapper.find('RemoveCoteacherDialog').dive();
    expect(Object.keys(dialog)).toHaveLength(0);
    let table = wrapper.find('CoteacherTable').dive();
    const cells = table.find('td');
    expect(cells).toHaveLength(9);
    const button = cells.at(2).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    table = wrapper.find('CoteacherTable').dive();
    expect(table.find('tr')).toHaveLength(3);

    dialog = wrapper.find('RemoveCoteacherDialog').dive();

    dialog
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();
    table = wrapper.find('CoteacherTable').dive();

    expect(table.find('tr')).toHaveLength(3);
    expect(wrapper.find('RemoveCoteacherDialog').dive()).toHaveLength(0);
  });
  it('Remove unsubmitted', () => {
    let coteachersToAdd = ['coelophysis@code.org', 'diplodocus@code.org'];
    const setCoteachersToAdd = func =>
      (coteachersToAdd = func(coteachersToAdd));

    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={setCoteachersToAdd}
        coteachersToAdd={coteachersToAdd}
        primaryTeacher={testPrimaryTeacher}
      />
    );
    let dialog = wrapper.find('RemoveCoteacherDialog').dive();
    expect(Object.keys(dialog)).toHaveLength(0);
    let table = wrapper.find('CoteacherTable').dive();
    const cells = table.find('td');
    const button = cells.at(2).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    table = wrapper.find('CoteacherTable').dive();
    expect(table.find('tr')).toHaveLength(4);

    dialog = wrapper.find('RemoveCoteacherDialog').dive();

    dialog
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    expect(coteachersToAdd).toEqual(['diplodocus@code.org']);
    wrapper.update();

    expect(wrapper.find('RemoveCoteacherDialog').dive()).toHaveLength(0);
  });
  it('Remove submitted', done => {
    const setCoteachersToAddSpy = sinon.spy();

    const fetchSpy = sinon.stub(window, 'fetch');
    fetchSpy.returns(Promise.resolve({ok: true}));

    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={setCoteachersToAddSpy}
        coteachersToAdd={['coelophysis@code.org']}
        primaryTeacher={testPrimaryTeacher}
      />
    );

    let dialog = wrapper.find('RemoveCoteacherDialog').dive();
    expect(Object.keys(dialog)).toHaveLength(0);

    const cells = wrapper.find('CoteacherTable').dive().find('td');
    const button = cells.at(5).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(wrapper.find('CoteacherTable').dive().find('tr')).toHaveLength(3);

    dialog = wrapper.find('RemoveCoteacherDialog').dive();

    dialog
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();

    // Need to wait for updates to finish
    setTimeout(() => {
      expect(wrapper.find('RemoveCoteacherDialog').dive()).toHaveLength(0);
      const table = wrapper.find('CoteacherTable').dive();
      expect(table.find('tr')).toHaveLength(2);
      expect(setCoteachersToAddSpy).not.toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      fetchSpy.restore();
      done();
    }, 50);
  });
});
