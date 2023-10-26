import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import CoteacherSettings from '@cdo/apps/templates/sectionsRefresh/CoteacherSettings';
import sinon from 'sinon';

const testSectionInstructors = [
  {instructorName: 'Allosaurus', instructorEmail: 'allosaurus@code.org'},
  {instructorName: 'Brachiosaurus', instructorEmail: 'brachiosaurus@code.org'},
];

describe('CoteacherSettings', () => {
  it('renders count of existing coteachers', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        addCoteacher={() => {}}
        coteachersToAdd={[]}
      />
    );
    expect(wrapper.find('Figcaption')).to.have.lengthOf(1);
    expect(wrapper.find('Figcaption').props().children).to.include(
      '1/5 co-teachers added'
    );
  });
  it('renders count if current sectionInstructors is null', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={null}
        addCoteacher={() => {}}
        coteachersToAdd={[]}
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
        addCoteacher={() => {}}
        coteachersToAdd={['coelophysis@code.org']}
      />
    );
    expect(wrapper.find('Figcaption')).to.have.lengthOf(1);
    expect(wrapper.find('Figcaption').props().children).to.include(
      '2/5 co-teachers added'
    );
  });
  it('disables add button when max coteachers reached', () => {
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        addCoteacher={() => {}}
        coteachersToAdd={[
          'coelophysis@code.org',
          'diplodocus@code.org',
          'eoraptor@code.org',
          'fylax@code.org',
        ]}
      />
    );
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
  });
  it('shows error when adding invalid email', () => {
    const addCoteacherSpy = sinon.spy();
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        addCoteacher={addCoteacherSpy}
        coteachersToAdd={[]}
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
    expect(addCoteacherSpy).to.have.not.been.called;
  });
  it('adds coteacher when valid email is added', () => {
    const addCoteacherSpy = sinon.spy();
    const wrapper = shallow(
      <CoteacherSettings
        sectionInstructors={testSectionInstructors}
        addCoteacher={addCoteacherSpy}
        coteachersToAdd={[]}
      />
    );
    wrapper
      .find('input')
      .simulate('change', {target: {value: 'new-email@code.org'}});
    wrapper
      .find('Button[id="add-coteacher"]')
      .simulate('click', {preventDefault: () => {}});
    expect(addCoteacherSpy).to.have.been.calledOnce;
    expect(addCoteacherSpy).to.have.been.calledWith('new-email@code.org');
  });
});
