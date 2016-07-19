import ReactTestUtils from 'react-addons-test-utils';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import {expect} from '../../util/configuredChai';
import {setupLocales} from '../../util/testUtils';
setupLocales();

var ImportProjectDialog = require('@cdo/apps/applab/ImportProjectDialog');
var {
  sources: sourcesApi,
  channels: channelsApi,
} = require('../../../src/clientApi');

describe("Applab ImportProjectDialog component", function () {

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
  });

  function render(theForm) {
    form = shallow(theForm);
    urlInput = form.find('input');
    nextButton = form.find('Confirm');
  }

  it("renders a div with a text input and next button", () => {
    render(<ImportProjectDialog />);
    expect(urlInput).to.have.length(1);
    expect(nextButton).to.have.length(1);
  });

  it("renders a warning if there was an error", () => {
    render(<ImportProjectDialog error={true} />);
    expect(form.find('p').last().text()).to.equal(
      "We can't seem to find this project. " +
      "Please make sure you've entered a valid App Lab project URL.");
  });

  it("it disables the next button and shows a spinner while the url is fetched", () => {
    render(<ImportProjectDialog isFetching={true} />);
    expect(nextButton.prop('disabled')).to.equal(true);
    expect(nextButton.find('.fa-spin')).to.have.length(1);
  });

  it("calls the onImport prop with the url when the next button is clicked", () => {
    var onImport = sinon.spy();
    render(<ImportProjectDialog onImport={onImport} />);
    urlInput.simulate(
      'change',
      {target: {value: 'some url'}}
    );
    nextButton.simulate('click');
    expect(onImport.calledWith('some url')).to.be.true;
  });

});
