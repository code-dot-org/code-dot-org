import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import Certificate from '@cdo/apps/templates/certificates/Certificate';
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
      CODE_ORG_URL: '//code.org',
    };
  });

  afterEach(() => {
    window.dashboard = storedWindowDashboard;
  });

  it('renders image with initialCertificateImageUrl', () => {
    const imageUrl = 'https://code.org/images/placeholder-hoc-image.jpg';
    const wrapper = wrapperWithParams({initialCertificateImageUrl: imageUrl});
    expect(wrapper.find('img').html()).to.include(imageUrl);
  });

  describe('personalized certificate', () => {
    let server;

    beforeEach(() => {
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    it('renders code studio image urls', () => {
      const data = {
        certificate_sent: true,
        name: 'Student',
      };
      server.respondWith('POST', `/v2/certificate`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(data),
      ]);

      const initialCertificateImageUrl =
        'https://code.org/images/placeholder-hoc-image.jpg';
      const wrapper = wrapperWithParams({
        tutorial: 'dance',
        certificateId: 'sessionId',
        initialCertificateImageUrl,
        isHocTutorial: true,
      });
      let image = wrapper.find('#uitest-certificate img');
      expect(image.prop('src')).to.equal(initialCertificateImageUrl);

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
      const encodedData = btoa(JSON.stringify(expectedData));
      const expectedFilename = encodedData
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
      const expectedSrc = `/certificate_images/${expectedFilename}.jpg`;
      expect(image.prop('src')).to.equal(expectedSrc);
    });
  });
});
