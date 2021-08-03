import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import NpsSurveyBlock from '@cdo/apps/templates/studioHomepages/NpsSurveyBlock';
import $ from 'jquery';

const result = {
  props: JSON.stringify({
    formQuestions: {},
    formName: 'name',
    formVersion: 0,
    submitApi: 'url'
  })
};

describe('npsSurveyBlock', () => {
  let ajaxStub;
  beforeEach(() => {
    ajaxStub = sinon.stub($, 'ajax');
  });

  afterEach(() => {
    ajaxStub.restore();
  });

  it('displays nothing on initial mount', () => {
    ajaxStub.returns({done: sinon.stub()});
    const wrapper = shallow(<NpsSurveyBlock />);
    expect(wrapper).to.be.empty;
  });

  it('displays nothing when no result is received from the server', () => {
    ajaxStub.returns({done: sinon.stub().callsArgWith(0, undefined)});
    const wrapper = shallow(<NpsSurveyBlock />);
    expect(wrapper).to.be.empty;
  });

  it('displays a foorm when a result is received from the server', () => {
    ajaxStub.returns({done: sinon.stub().callsArgWith(0, result)});
    const wrapper = shallow(<NpsSurveyBlock />);
    expect(wrapper.find('Foorm').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('completing the survey hides the button', () => {
    ajaxStub.returns({done: sinon.stub().callsArgWith(0, result)});
    const wrapper = shallow(<NpsSurveyBlock />);
    wrapper.instance().onComplete({data: {}});
    wrapper.update();
    expect(wrapper.find('Foorm').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(0);
  });

  it('dismissing the survey hides the button', () => {
    ajaxStub.returns({done: sinon.stub().callsArgWith(0, result)});
    const wrapper = shallow(<NpsSurveyBlock />);
    wrapper.instance().silentlyDismissSurvey();
    wrapper.update();
    expect(wrapper.find('Foorm').length).to.equal(0);
    expect(wrapper.find('Button').length).to.equal(0);
    expect(wrapper).to.be.empty;
  });
});
