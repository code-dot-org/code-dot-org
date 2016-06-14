import ReactTestUtils from 'react-addons-test-utils';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import {expect} from '../../util/configuredChai';
import {setupLocales} from '../../util/testUtils';
setupLocales();

var ImportProjectForm = require('@cdo/apps/applab/ImportProjectForm');
var {
  sources: sourcesApi,
  channels: channelsApi,
} = require('../../../src/clientApi');

describe("Applab ImportProjectForm component", function () {

  var form, urlInput, nextButton, onProjectFetched;

  beforeEach(() => {
    sinon.stub(sourcesApi, "ajax");
    sinon.stub(channelsApi, "ajax");
  });

  afterEach(() => {
    sourcesApi.ajax.restore();
    channelsApi.ajax.restore();
  });

  beforeEach(() => {
    onProjectFetched = sinon.spy();
    form = shallow(<ImportProjectForm onProjectFetched={onProjectFetched} />);
    update();
  });

  function update() {
    form.update();
    urlInput = form.find('input');
    nextButton = form.find('button');
  }

  it("renders a div with a text input and next button", () => {
    expect(urlInput).to.have.length(1);
    expect(nextButton).to.have.length(1);
  });

  it("renders a warning if an invalid url is entered", () => {
    urlInput.simulate('change', {target: {value: 'some url'}});
    nextButton.simulate('click');
    update();
    expect(form.find('p').last().text()).to.equal(
      "We can't seem to find this project. " +
      "Please make sure you've entered a valid App Lab project URL.");
  });

  describe('when a valid url is entered', () => {
    var sourcesSuccess, sourcesError, channelsSuccess, channelsError;
    beforeEach(() => {
      urlInput.simulate(
        'change',
        {target: {value: 'http://studio.code.org/projects/applab/some-applab-app/'}}
      );
      nextButton.simulate('click');
      [,,sourcesSuccess, sourcesError] = sourcesApi.ajax.lastCall.args;
      [,,channelsSuccess, channelsError] = channelsApi.ajax.lastCall.args;
      update();
    });

    it("called out channels and sources api to fetch the project", () => {
      expect(sourcesApi.ajax).to.have.been.called;
      expect(channelsApi.ajax).to.have.been.called;
    });

    it("it disables the next button and shows a spinner while the url is fetched", () => {
      expect(nextButton.prop('disabled')).to.equal(true);
      expect(nextButton.find('.fa-spin')).to.have.length(1);
    });

    it("shows an error message if the sources api fails", () => {
      sourcesError();
      update();
      expect(form.find('p').last().text()).to.equal(
        "We can't seem to find this project. " +
        "Please make sure you've entered a valid App Lab project URL.");
    });

    it("shows an error message if the channels api fails", () => {
      channelsError();
      update();
      expect(form.find('p').last().text()).to.equal(
        "We can't seem to find this project. " +
        "Please make sure you've entered a valid App Lab project URL.");
    });

    it("calls the onProjectFetched prop when *both* the sources and channels apis succeed", () => {
      channelsSuccess({response: JSON.stringify({})});
      expect(onProjectFetched).not.to.have.been.called;
      sourcesSuccess({response: JSON.stringify({})});
      expect(onProjectFetched).to.have.been.called;
    });
  });

});
