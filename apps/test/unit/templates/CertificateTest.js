import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import Certificate from '@cdo/apps/templates/Certificate';
import {combineReducers, createStore} from 'redux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import sinon from 'sinon';

const store = createStore(combineReducers({responsive, isRtl}));

function wrapperWithParams(params) {
  return mount(
    <Provider store={store}>
      <Certificate {...params} />
    </Provider>
  );
}

describe('Certificate', () => {
  let storedWindowDashboard;

  beforeEach(() => {
    storedWindowDashboard = window.dashboard;
    window.dashboard = {
      CODE_ORG_URL: 'https://code.org'
    };
  });

  afterEach(() => {
    window.dashboard = storedWindowDashboard;
  });

  it('renders Minecraft certificate for Minecraft Adventurer', () => {
    const wrapper = wrapperWithParams({tutorial: 'mc'});
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate'
    );
  });

  it('renders Minecraft certificate for Minecraft Designer', () => {
    const wrapper = wrapperWithParams({tutorial: 'minecraft'});
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate'
    );
  });

  it("renders unique certificate for Minecraft Hero's Journey", () => {
    const wrapper = wrapperWithParams({tutorial: 'hero'});
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate_Hero'
    );
  });

  it('renders unique certificate for Minecraft Voyage Aquatic', () => {
    const wrapper = wrapperWithParams({tutorial: 'aquatic'});
    expect(wrapper.find('img').html()).to.include(
      'MC_Hour_Of_Code_Certificate_Aquatic'
    );
  });

  it('renders default certificate for all other tutorials', () => {
    ['applab-intro', 'dance', 'flappy', 'frozen'].forEach(tutorial => {
      const wrapper = wrapperWithParams({tutorial});
      expect(wrapper.find('img').html()).to.include('hour_of_code_certificate');
    });
  });

  describe('personalized certificate', () => {
    let server;

    beforeEach(() => {
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    it('renders using pegasus without experiment', () => {
      const data = {
        certificate_sent: true,
        name: 'Student'
      };
      server.respondWith('POST', `/v2/certificate`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(data)
      ]);

      const wrapper = wrapperWithParams({
        tutorial: 'dance',
        certificateId: 'sessionId'
      });
      let image = wrapper.find('#uitest-certificate img');
      expect(image.prop('src')).to.match(
        /^\/_karma_webpack_\/hour_of_code_certificate/
      );

      const printLink = wrapper.find('.social-print-link');
      expect(printLink.prop('href')).to.equal(
        'https://code.org/printcertificate/sessionId'
      );

      // the share link is used in the image thumbnail as well as the facebook
      // and twitter links. just test its value in the thumbnail, because it is
      // harder to extract from the facebook and twitter links.
      const thumbnailLink = wrapper.find('#uitest-certificate a');
      expect(thumbnailLink.prop('href')).to.equal(
        'https:https://code.org/certificates/sessionId'
      );

      const input = wrapper.find('input#name');
      input.simulate('change', {target: {value: 'Student'}});
      const submitButton = wrapper
        .find('button')
        .filterWhere(button => button.text() === 'Submit');
      submitButton.simulate('click');
      server.respond();

      wrapper.update();
      image = wrapper.find('#uitest-certificate img');
      expect(image.prop('src')).to.equal(
        'https://code.org/api/hour/certificate/sessionId.jpg'
      );
    });

    it('renders using code studio with experiment', () => {
      const data = {
        certificate_sent: true,
        name: 'Student'
      };
      server.respondWith('POST', `/v2/certificate`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(data)
      ]);

      const wrapper = wrapperWithParams({
        tutorial: 'dance',
        certificateId: 'sessionId',
        showStudioCertificate: true
      });
      let image = wrapper.find('#uitest-certificate img');
      expect(image.prop('src')).to.match(
        /^\/_karma_webpack_\/hour_of_code_certificate/
      );

      const printLink = wrapper.find('.social-print-link');
      expect(printLink.prop('href')).to.match(/^\/print_certificates/);

      // the share link is used in the image thumbnail as well as the facebook
      // and twitter links. just test its value in the thumbnail, because it is
      // harder to extract from the facebook and twitter links.
      const thumbnailLink = wrapper.find('#uitest-certificate a');
      expect(thumbnailLink.prop('href')).to.match(/^\/certificates/);

      const input = wrapper.find('input#name');
      input.simulate('change', {target: {value: 'Student'}});
      const submitButton = wrapper
        .find('button')
        .filterWhere(button => button.text() === 'Submit');
      submitButton.simulate('click');
      server.respond();

      wrapper.update();
      image = wrapper.find('#uitest-certificate img');
      const expectedData = {name: 'Student', course: 'dance'};
      const expectedFilename = btoa(JSON.stringify(expectedData));
      const expectedSrc = `/certificate_images/${expectedFilename}.jpg`;
      expect(image.prop('src')).to.equal(expectedSrc);
    });
  });
});
