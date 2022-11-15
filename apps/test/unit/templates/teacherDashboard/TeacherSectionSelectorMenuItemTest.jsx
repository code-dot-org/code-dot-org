import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedTeacherSectionSelectorMenuItem as TeacherSectionSelectorMenuItem} from '@cdo/apps/templates/teacherDashboard/TeacherSectionSelectorMenuItem';

describe('TeacherSectionSelectorMenuItemTest', () => {
  describe('icons', () => {
    it('shows check mark for a section where isAssigned is true', () => {
      const section = {
        id: 1,
        isAssigned: true,
        name: 'test section'
      };
      const wrapper = shallow(
        <TeacherSectionSelectorMenuItem section={section} onClick={() => {}} />
      );
      expect(wrapper.find('FontAwesome').length).to.equal(1);
      expect(
        wrapper
          .find('FontAwesome')
          .first()
          .props().icon
      ).to.equal('check');
    });

    it('shows a square for a section where isAssigned is false', () => {
      const section = {
        id: 1,
        isAssigned: false,
        name: 'test section'
      };
      const wrapper = shallow(
        <TeacherSectionSelectorMenuItem section={section} onClick={() => {}} />
      );
      expect(wrapper.find('FontAwesome').length).to.equal(1);
      expect(
        wrapper
          .find('FontAwesome')
          .first()
          .props().icon
      ).to.equal('square-o');
    });

    it('shows an X for a section where isAssigned is true when hovering', () => {
      const section = {
        id: 1,
        isAssigned: true,
        name: 'test section'
      };
      const wrapper = shallow(
        <TeacherSectionSelectorMenuItem section={section} onClick={() => {}} />
      );
      wrapper
        .find('span')
        .first()
        .simulate('mouseenter');
      expect(
        wrapper
          .find('FontAwesome')
          .first()
          .props().icon
      ).to.equal('times');
    });

    it('shows a check for a section where isAssigned is false when hovering', () => {
      const section = {
        id: 1,
        isAssigned: false,
        name: 'test section'
      };
      const wrapper = shallow(
        <TeacherSectionSelectorMenuItem section={section} onClick={() => {}} />
      );
      wrapper
        .find('span')
        .first()
        .simulate('mouseenter');
      expect(
        wrapper
          .find('FontAwesome')
          .first()
          .props().icon
      ).to.equal('check');
    });
  });

  it('calls assignToSection', async () => {
    const section = {
      id: 1,
      isAssigned: false,
      name: 'test section'
    };
    const assignToSectionSpy = sinon
      .stub()
      .returns(new Promise(resolve => resolve()));
    const unassignSectionSpy = sinon
      .stub()
      .returns(new Promise(resolve => resolve()));
    const wrapper = shallow(
      <TeacherSectionSelectorMenuItem
        section={section}
        onClick={() => {}}
        assignToSection={assignToSectionSpy}
        unassignSection={unassignSectionSpy}
      />
    );

    wrapper
      .find('span')
      .first()
      .simulate('click', {
        preventDefault: () => {},
        stopPropagation: () => {}
      });
    expect(
      wrapper
        .find('FontAwesome')
        .first()
        .props().icon
    ).to.equal('spinner');

    expect(assignToSectionSpy).to.have.been.calledOnce;
    expect(unassignSectionSpy).to.not.have.been.called;
  });

  it('calls unassignSection', async () => {
    const section = {
      id: 1,
      isAssigned: true,
      name: 'test section'
    };
    const assignToSectionSpy = sinon
      .stub()
      .returns(new Promise(resolve => resolve()));
    const unassignSectionSpy = sinon
      .stub()
      .returns(new Promise(resolve => resolve()));
    const wrapper = shallow(
      <TeacherSectionSelectorMenuItem
        section={section}
        onClick={() => {}}
        assignToSection={assignToSectionSpy}
        unassignSection={unassignSectionSpy}
      />
    );

    wrapper
      .find('span')
      .first()
      .simulate('click', {
        preventDefault: () => {},
        stopPropagation: () => {}
      });
    expect(
      wrapper
        .find('FontAwesome')
        .first()
        .props().icon
    ).to.equal('spinner');

    expect(assignToSectionSpy).to.not.have.been;
    expect(unassignSectionSpy).to.have.been.calledOnce;
  });

  it('calls onClick when clicked', () => {
    const section = {
      id: 1,
      isAssigned: true,
      name: 'test section'
    };
    const onClickSpy = sinon.spy();
    const wrapper = shallow(
      <TeacherSectionSelectorMenuItem section={section} onClick={onClickSpy} />
    );

    wrapper.simulate('click');
    expect(onClickSpy).to.have.been.calledOnce;
  });
});
