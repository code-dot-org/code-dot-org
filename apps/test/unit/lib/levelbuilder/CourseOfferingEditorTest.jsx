import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import CourseOfferingEditor from '@cdo/apps/lib/levelbuilder/CourseOfferingEditor';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('CourseOfferingEditor', () => {
  let defaultProps;

  const deviceCompatibilities = {
    computer: 'incompatible',
    chromebook: 'not_recommended',
    tablet: 'not_recommended',
    mobile: 'ideal',
    no_device: '',
  };

  beforeEach(() => {
    defaultProps = {
      initialCourseOffering: {
        key: 'test-course-offering',
        is_featured: false,
        display_name: 'Course Offering 1',
        assignable: true,
        grade_levels: 'K',
        curriculum_type: 'Module',
        header: 'Self-Paced',
        marketing_initiative: 'HOC',
        image: 'https://images.code.org/spritelab.JPG',
        cs_topic: 'art_and_design',
        school_subject: 'science,english_language_arts',
        device_compatibility: JSON.stringify(deviceCompatibilities),
        description: 'An introductory course into computer science.',
        professional_learning: 'code.org/apply',
        self_paced_pl_course_offering_id: 1,
        video: 'https://www.youtube-nocookie.com/test_video',
        published_date: '2019-07-16 14:00:00',
      },
      selfPacedPLCourseOfferings: [
        {
          id: 1,
          key: 'test-self-paced-pl-1',
          display_name: 'Self Paced PL 1',
        },
        {
          id: 53,
          key: 'test-self-paced-pl-2',
          display_name: 'Self Paced PL 2',
        },
        {
          id: 135,
          key: 'test-self-paced-pl-3',
          display_name: 'Self Paced PL 3',
        },
      ],
      professionalLearningProgramPaths: {
        'K5 Workshops': 'code.org/professional-development-workshops',
        '6-12 Workshops': 'code.org/apply',
      },
      videos: [
        {
          name: 'test_video',
          youtube_url: 'https://www.youtube-nocookie.com/test_video',
          thumbnail: null,
          locale: 'en-US',
        },
      ],
    };
  });

  describe('Saving Course Offering Editor', () => {
    let clock, server;

    beforeEach(() => {
      server = sinon.fakeServer.create();
      sinon.stub(utils, 'navigateToHref');
    });

    afterEach(() => {
      if (clock) {
        clock.restore();
        clock = undefined;
      }
      server.restore();
      utils.navigateToHref.restore();
    });

    it('can save and keep editing', () => {
      const wrapper = mount(<CourseOfferingEditor {...defaultProps} />);

      let returnData = {
        key: 'test-course-offering',
        display_name: 'Course Offering 2',
        is_featured: true,
        assignable: true,
        grade_levels: 'K',
        curriculum_type: 'Module',
        header: 'Self-Paced',
        marketing_initiative: 'HOC',
        image: 'https://images.code.org/spritelab.JPG',
        cs_topic: 'art_and_design',
        school_subject: 'science,english_language_arts',
        device_compatibility: JSON.stringify(deviceCompatibilities),
        description: 'An introductory course into computer science.',
        professional_learning: 'code.org/apply',
        video: 'https://www.youtube-nocookie.com/test_video',
        published_date: '2019-07-16 14:00:00',
      };
      server.respondWith('PUT', '/course_offerings/test-course-offering', [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData),
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);

      clock = sinon.useFakeTimers(new Date('2020-12-01'));
      server.respond();
      clock.tick(50);

      wrapper.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      //check that last saved message is showing
      expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = mount(<CourseOfferingEditor {...defaultProps} />);

      let returnData = 'There was an error';
      server.respondWith('PUT', '/course_offerings/test-course-offering', [
        404,
        {'Content-Type': 'application/json'},
        returnData,
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);

      server.respond();
      wrapper.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;
    });

    it('can save and close', () => {
      const wrapper = mount(<CourseOfferingEditor {...defaultProps} />);

      let returnData = {
        key: 'test-course-offering',
        display_name: 'Course Offering 2',
        is_featured: true,
        grade_levels: 'K,1,2,3',
        curriculum_type: 'Course',
        header: 'Self-Paced',
        marketing_initiative: 'HOC',
        image: 'https://images.code.org/spritelab.JPG',
        cs_topic: 'art_and_design',
        school_subject: 'science,english_language_arts',
        device_compatibility: JSON.stringify(deviceCompatibilities),
        description: 'An introductory course into computer science.',
        professional_learning: 'code.org/apply',
        video: 'https://www.youtube-nocookie.com/test_video',
        published_date: '2019-07-16 14:00:00',
      };

      server.respondWith('PUT', '/course_offerings/test-course-offering', [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData),
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(2);
      expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);

      server.respond();
      wrapper.update();
      expect(utils.navigateToHref).to.have.been.calledWith(
        `/${window.location.search}`
      );
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = mount(<CourseOfferingEditor {...defaultProps} />);

      let returnData = 'There was an error';
      server.respondWith('PUT', '/course_offerings/test-course-offering', [
        404,
        {'Content-Type': 'application/json'},
        returnData,
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(2);
      expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);

      server.respond();

      wrapper.update();
      expect(utils.navigateToHref).to.not.have.been.called;

      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;
    });
  });
});
