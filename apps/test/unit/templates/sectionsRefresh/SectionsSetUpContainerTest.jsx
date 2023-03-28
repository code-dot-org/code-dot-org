import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import sinon from 'sinon';
import * as utils from '@cdo/apps/code-studio/utils';

describe('SectionsSetUpContainer', () => {
  it('renders an initial set up section form', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('SingleSectionSetUp').length).to.equal(1);
  });

  it('renders headers and button', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('h1').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(2);
    expect(
      wrapper
        .find('Button')
        .at(0)
        .props().text
    ).to.equal('Save and add another class section');
    expect(
      wrapper
        .find('Button')
        .at(1)
        .props().text
    ).to.equal('Finish creating sections');
  });

  it('renders edit header and save button', () => {
    const wrapper = shallow(
      <SectionsSetUpContainer sectionToBeEdited={true} />
    );

    expect(wrapper.find('h1').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(1);
    expect(
      wrapper
        .find('Button')
        .at(0)
        .props().text
    ).to.equal('Save');
  });

  it('renders curriculum quick assign', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('CurriculumQuickAssign').length).to.equal(1);
  });

  it('renders advanced settings', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    wrapper
      .find('FontAwesome')
      .at(0)
      .simulate('click', {preventDefault: () => {}});

    expect(wrapper.find('AdvancedSettingToggles').length).to.equal(1);
  });

  it('updates caret direction when Advacned Settings is clicked', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(
      wrapper
        .find('FontAwesome')
        .at(0)
        .props().icon
    ).to.equal('caret-right');
    wrapper
      .find('FontAwesome')
      .at(0)
      .simulate('click', {preventDefault: () => {}});
    expect(
      wrapper
        .find('FontAwesome')
        .at(0)
        .props().icon
    ).to.equal('caret-down');
  });

  it('validates the form when save is clicked', () => {
    const reportSpy = sinon.spy();
    sinon
      .stub(document, 'querySelector')
      .withArgs('#sections-set-up-container')
      .returns({
        checkValidity: () => {},
        reportValidity: reportSpy
      });

    const wrapper = shallow(<SectionsSetUpContainer />);

    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    expect(reportSpy).to.have.been.called.once;

    sinon.restore();
  });

  it('makes an ajax request when save is clicked', () => {
    sinon
      .stub(document, 'querySelector')
      .withArgs('#sections-set-up-container')
      .returns({
        checkValidity: () => true
      })
      .withArgs('meta[name="csrf-token"]')
      .returns({
        attributes: {content: {value: null}}
      });
    const fetchSpy = sinon.spy(window, 'fetch');

    const wrapper = shallow(<SectionsSetUpContainer />);

    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    expect(fetchSpy).to.have.been.called.once;

    sinon.restore();
  });

  it('passes participantType and loginTyp to ajax request when save is clicked', () => {
    sinon
      .stub(document, 'querySelector')
      .withArgs('#sections-set-up-container')
      .returns({
        checkValidity: () => true
      })
      .withArgs('meta[name="csrf-token"]')
      .returns({
        attributes: {content: {value: null}}
      });
    sinon
      .stub(utils, 'queryParams')
      .withArgs('loginType')
      .returns('word')
      .withArgs('participantType')
      .returns('student');
    const fetchSpy = sinon.spy(window, 'fetch');

    const wrapper = shallow(<SectionsSetUpContainer />);

    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    expect(fetchSpy).to.have.been.called.once;
    const fetchBody = JSON.parse(fetchSpy.getCall(0).args[1].body);
    expect(fetchBody.login_type).to.equal('word');
    expect(fetchBody.participant_type).to.equal('student');

    sinon.restore();
  });
});
