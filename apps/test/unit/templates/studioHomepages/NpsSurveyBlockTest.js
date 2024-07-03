import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import sinon from 'sinon';

import NpsSurveyBlock from '@cdo/apps/templates/studioHomepages/NpsSurveyBlock';



const result = {
  props: JSON.stringify({
    formQuestions: {},
    formName: 'name',
    formVersion: 0,
    submitApi: 'url',
  }),
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
    expect(Object.keys(wrapper)).toHaveLength(0);
  });

  it('displays nothing when no result is received from the server', () => {
    ajaxStub.returns({done: sinon.stub().callsArgWith(0, undefined)});
    const wrapper = shallow(<NpsSurveyBlock />);
    expect(Object.keys(wrapper)).toHaveLength(0);
  });

  it('displays a foorm when a result is received from the server', () => {
    ajaxStub.returns({done: sinon.stub().callsArgWith(0, result)});
    const wrapper = shallow(<NpsSurveyBlock />);
    expect(wrapper.find('Foorm').length).toBe(1);
    expect(wrapper.find('Button').length).toBe(1);
  });

  it('completing the survey hides the button', () => {
    ajaxStub.returns({done: sinon.stub().callsArgWith(0, result)});
    const wrapper = shallow(<NpsSurveyBlock />);
    wrapper.instance().onComplete({data: {}});
    wrapper.update();
    expect(wrapper.find('Foorm').length).toBe(1);
    expect(wrapper.find('Button').length).toBe(0);
  });

  it('dismissing the survey hides the button', () => {
    ajaxStub.returns({done: sinon.stub().callsArgWith(0, result)});
    const wrapper = shallow(<NpsSurveyBlock />);
    wrapper.instance().silentlyDismissSurvey();
    wrapper.update();
    expect(wrapper.find('Foorm').length).toBe(0);
    expect(wrapper.find('Button').length).toBe(0);
    expect(Object.keys(wrapper)).toHaveLength(0);
  });
});
