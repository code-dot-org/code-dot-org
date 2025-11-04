import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import Certificate from '@cdo/apps/templates/certificates/Certificate';
import * as AuthTokenStore from '@cdo/apps/util/AuthenticityTokenStore';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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

  describe('personalized certificate', () => {
    const authToken = 'fake-token';
    let server;

    beforeEach(() => {
      sinon.stub(AuthTokenStore, 'getAuthenticityToken').resolves(authToken);
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      sinon.restore();
      server.restore();
    });

    it('renders code studio image urls', async () => {
      const data = {
        certificate_sent: true,
        name: 'Student',
      };
      server.respondWith('POST', studio('/api/hour/certificate'), [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(data),
      ]);

      const wrapper = wrapperWithParams({
        certificateData: [
          {
            courseName: 'dance',
          },
        ],
        certificateId: 'sessionId',
        isHocTutorial: true,
      });
      let image = wrapper.find('#uitest-certificate img');
      expect(image.prop('src')).to.include('/certificate_images/');

      const printLink = wrapper.find('a.social-print-link').first();
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

      // `personalizeHocCertificate` awaits the authenticity token before issuing the ajax request.
      // Give the microtask queue a chance to flush so the request is created before responding with the fake server.
      await new Promise(resolve => setTimeout(resolve));
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

    it('passes down full urls to SocialShare', () => {
      const wrapper = wrapperWithParams({
        certificateData: [
          {
            courseName: 'dance',
          },
        ],
        certificateId: 'sessionId',
        isHocTutorial: true,
      });
      const socialShare = wrapper.find('SocialShare');
      expect(socialShare.props().facebook).to.include('studio.code.org');
      expect(socialShare.props().twitter).to.include('studio.code.org');
    });
  });

  it('renders swiper for multiple certificates', () => {
    const wrapper = wrapperWithParams({
      certificateData: [
        {
          courseName: 'csd1-2023',
          coursePath: '/courses/csd-2023/units/1',
        },
        {
          courseName: 'csd2-2023',
          coursePath: '/courses/csd-2023/units/2',
        },
      ],
      certificateId: 'sessionId',
      isHocTutorial: false,
    });
    expect(wrapper.find('swiper-container').exists()).to.be.true;
    expect(wrapper.find('swiper-slide').length).to.equal(2);

    expect(wrapper.find('LargeChevronLink').props().link).to.equal(
      '/courses/csd-2023/units/1'
    );
  });

  it('does not render swiper for single certificate', () => {
    const wrapper = wrapperWithParams({
      certificateData: [
        {
          courseName: 'csd1-2023',
          coursePath: '/courses/csd-2023/units/1',
        },
      ],
      certificateId: 'sessionId',
      isHocTutorial: false,
    });
    expect(wrapper.find('swiper-container').exists()).to.be.false;
    expect(wrapper.find('#certificate-swiper-prev-el').exists()).to.be.false;
    expect(wrapper.find('#certificate-swiper-next-el').exists()).to.be.false;
  });
});
