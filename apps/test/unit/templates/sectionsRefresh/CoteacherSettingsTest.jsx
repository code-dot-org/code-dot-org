import $ from 'jquery';
import React from 'react';
import {mount, shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import CoteacherSettings from '@cdo/apps/templates/sectionsRefresh/CoteacherSettings';
import sinon from 'sinon';

const testPrimaryTeacher = {
  name: 'T-rex',
  email: 'tyrannosaurus.rex@code.org',
  isPrimary: 'true',
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
        primaryInstructor={testPrimaryTeacher}
      />
    );
    expect(wrapper.find('Figcaption')).to.have.lengthOf(1);
    expect(wrapper.find('Figcaption').props().children).to.include(
      '2/5 co-teachers added'
    );
  });
  it('renders count if current sectionInstructors is null', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={null}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={[]}
        primaryInstructor={null}
      />
    );
    expect(wrapper.find('Figcaption')).to.have.lengthOf(1);
    expect(wrapper.find('Figcaption').props().children).to.include(
      '0/5 co-teachers added'
    );
  });
  it('renders count of existing coteachers and added', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={['coelophysis@code.org']}
        primaryInstructor={testPrimaryTeacher}
      />
    );
    expect(wrapper.find('Figcaption')).to.have.lengthOf(1);
    expect(wrapper.find('Figcaption').props().children).to.include(
      '3/5 co-teachers added'
    );
  });
  it('disables add button when max coteachers reached', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={[
          'coelophysis@code.org',
          'diplodocus@code.org',
          'eoraptor@code.org',
        ]}
        primaryInstructor={testPrimaryTeacher}
      />
    );
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
  });
  it('shows error when adding invalid email', () => {
    const setCoteachersToAddSpy = sinon.spy();
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={setCoteachersToAddSpy}
        coteachersToAdd={[]}
        primaryInstructor={testPrimaryTeacher}
      />
    );
    expect(wrapper.find('Figcaption')).to.have.lengthOf(1);
    expect(wrapper.find('Figcaption').props().children).not.to.include(
      'not a valid email address'
    );
    wrapper
      .find('input')
      .simulate('change', {target: {value: 'invalid-email'}});
    wrapper
      .find('Button[id="add-coteacher"]')
      .simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('Figcaption').props().children).to.include(
      'invalid-email is not a valid email address.'
    );
    const icon = wrapper.find('FontAwesome').first();
    expect(icon.props().icon).to.include('info-circle');
    expect(setCoteachersToAddSpy).to.have.not.been.called;
  });
  it('adds coteacher when valid email is added', () => {
    let coteachersToAdd = ['coelophysis@code.org'];
    const setCoteachersToAdd = func =>
      (coteachersToAdd = func(coteachersToAdd));

    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={setCoteachersToAdd}
        coteachersToAdd={coteachersToAdd}
        primaryInstructor={testPrimaryTeacher}
      />
    );
    wrapper
      .find('input')
      .simulate('change', {target: {value: 'new-email@code.org'}});
    wrapper
      .find('Button[id="add-coteacher"]')
      .simulate('click', {preventDefault: () => {}});
    expect(coteachersToAdd).to.deep.equal([
      'new-email@code.org',
      'coelophysis@code.org',
    ]);
  });
  it('shows coteacher table and sorts instructors', () => {
    const wrapper = mount(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={['coelophysis@code.org']}
        primaryInstructor={testPrimaryTeacher}
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
  it('clicking remove opens dialog', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={() => {}}
        coteachersToAdd={['coelophysis@code.org']}
        primaryInstructor={testPrimaryTeacher}
      />
    );
    expect(wrapper.find('AccessibleDialog')).to.be.empty;
    const cells = wrapper.find('td');
    expect(cells).to.have.lengthOf(9);
    const button = cells.at(2).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    const dialog = wrapper.find('AccessibleDialog');
    expect(dialog).to.exist;

    dialog.shallow();

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
        primaryInstructor={testPrimaryTeacher}
      />
    );
    expect(wrapper.find('AccessibleDialog')).to.be.empty;
    const cells = wrapper.find('td');
    expect(cells).to.have.lengthOf(9);
    const button = cells.at(2).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(wrapper.find('tr')).to.have.lengthOf(3);

    const dialog = wrapper.find('AccessibleDialog');

    dialog.shallow();

    dialog
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(wrapper.find('tr')).to.have.lengthOf(3);
    expect(wrapper.find('AccessibleDialog')).to.be.empty;
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
        primaryInstructor={testPrimaryTeacher}
      />
    );
    expect(wrapper.find('AccessibleDialog')).to.be.empty;
    const cells = wrapper.find('td');
    const button = cells.at(2).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(wrapper.find('tr')).to.have.lengthOf(4);

    const dialog = wrapper.find('AccessibleDialog');

    dialog.shallow();

    dialog
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    expect(coteachersToAdd).to.deep.equal(['diplodocus@code.org']);
    wrapper.update();

    expect(wrapper.find('AccessibleDialog')).to.be.empty;
  });
  it('Remove submitted', () => {
    const setCoteachersToAddSpy = sinon.spy();

    const ajaxStub = sinon.stub($, 'ajax').returns({
      done: successCallback => {
        successCallback();
        return {fail: () => {}};
      },
    });

    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        setCoteachersToAdd={setCoteachersToAddSpy}
        coteachersToAdd={['coelophysis@code.org']}
        primaryInstructor={testPrimaryTeacher}
      />
    );
    expect(wrapper.find('AccessibleDialog')).to.be.empty;
    const cells = wrapper.find('td');
    const button = cells.at(5).find('button');
    button.at(0).simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(wrapper.find('tr')).to.have.lengthOf(3);

    const dialog = wrapper.find('AccessibleDialog');

    dialog.shallow();

    dialog
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(wrapper.find('AccessibleDialog')).to.be.empty;
    expect(wrapper.find('tr')).to.have.lengthOf(2);
    expect(setCoteachersToAddSpy).to.have.not.been.called;
    expect(ajaxStub).to.have.been.calledOnce;
    $.ajax.restore();
  });
});
