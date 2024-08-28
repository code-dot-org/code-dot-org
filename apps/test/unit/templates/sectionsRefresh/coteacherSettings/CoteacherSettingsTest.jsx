import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import CoteacherSettings from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/CoteacherSettings';
import i18n from '@cdo/locale';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    expect(addCoteacher.find('Figcaption')).to.have.lengthOf(1);
    expect(addCoteacher.find('Figcaption').props().children).to.include(
      '2/5 co-teachers added'
    );
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
    expect(addCoteacher.find('Figcaption')).to.have.lengthOf(1);
    expect(addCoteacher.find('Figcaption').props().children).to.include(
      '0/5 co-teachers added'
    );
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
    expect(addCoteacher.find('Figcaption')).to.have.lengthOf(1);
    expect(addCoteacher.find('Figcaption').props().children).to.include(
      '3/5 co-teachers added'
    );
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
    expect(wrapper.find('tr')).to.have.lengthOf(3);
    const cells = wrapper.find('td');
    expect(cells).to.have.lengthOf(9);
    expect(cells.at(0).text()).to.include('coelophysis@code.org');
    expect(cells.at(1).text()).to.include('PENDING');
    expect(cells.at(3).text()).to.not.include('Brachiosaurus');
    expect(cells.at(3).text()).to.include('brachiosaurus@code.org');
    expect(cells.at(4).text()).to.include('PENDING');
    expect(cells.at(6).text()).to.include('Allosaurus');
    expect(cells.at(6).text()).to.include('allosaurus@code.org');
    expect(cells.at(7).text()).to.include('ACCEPTED');
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
    expect(addCoteacher.text()).to.equal(i18n.coteacherLtiAddInfo());

    const cells = wrapper.find('CoteacherTable').dive().find('td');
    const button = cells.find('button');
    expect(button).to.have.lengthOf(0);
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
    expect(dialog).to.be.empty;
    const table = wrapper.find('CoteacherTable').dive();
    const cells = table.find('td');
    expect(cells).to.have.lengthOf(9);
    const button = cells.at(2).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    dialog = wrapper.find('RemoveCoteacherDialog').dive();

    expect(wrapper.find('RemoveCoteacherDialog').length).to.equal(1);
    expect(dialog.find('Button')).to.have.lengthOf(2);
    expect(dialog.find('StrongText').dive().text()).to.contain(
      'Remove coelophysis@code.org'
    );
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
    expect(dialog).to.be.empty;
    let table = wrapper.find('CoteacherTable').dive();
    const cells = table.find('td');
    expect(cells).to.have.lengthOf(9);
    const button = cells.at(2).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    table = wrapper.find('CoteacherTable').dive();
    expect(table.find('tr')).to.have.lengthOf(3);

    dialog = wrapper.find('RemoveCoteacherDialog').dive();

    dialog
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();
    table = wrapper.find('CoteacherTable').dive();

    expect(table.find('tr')).to.have.lengthOf(3);
    expect(wrapper.find('RemoveCoteacherDialog').dive()).to.be.empty;
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
    expect(dialog).to.be.empty;
    let table = wrapper.find('CoteacherTable').dive();
    const cells = table.find('td');
    const button = cells.at(2).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    table = wrapper.find('CoteacherTable').dive();
    expect(table.find('tr')).to.have.lengthOf(4);

    dialog = wrapper.find('RemoveCoteacherDialog').dive();

    dialog
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    expect(coteachersToAdd).to.deep.equal(['diplodocus@code.org']);
    wrapper.update();

    expect(wrapper.find('RemoveCoteacherDialog').dive()).to.be.empty;
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
    expect(dialog).to.be.empty;

    const cells = wrapper.find('CoteacherTable').dive().find('td');
    const button = cells.at(5).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(wrapper.find('CoteacherTable').dive().find('tr')).to.have.lengthOf(
      3
    );

    dialog = wrapper.find('RemoveCoteacherDialog').dive();

    dialog
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();

    // Need to wait for updates to finish
    setTimeout(() => {
      expect(wrapper.find('RemoveCoteacherDialog').dive()).to.be.empty;
      const table = wrapper.find('CoteacherTable').dive();
      expect(table.find('tr')).to.have.lengthOf(2);
      expect(setCoteachersToAddSpy).to.have.not.been.called;
      expect(fetchSpy).to.have.been.calledOnce;
      fetchSpy.restore();
      done();
    }, 50);
  });
});
