import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import CourseOfferingEditor from '@cdo/apps/lib/levelbuilder/CourseOfferingEditor';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

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
        category: 'Other',
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
        self_paced_professional_learning: 'Teaching AI and Machine Learning',
        professional_learning:
          'https://code.org/educate/professional-learning/middle-high',
      },
      selfPacedPLCourseOfferings: [
        {
          key: 'self-paced-pl-csd5',
          display_name: 'Teaching AI and Machine Learning',
          course_version_path: '/s/self-paced-pl-csd5-2022',
        },
        {
          key: 'alltheselfpacedplthings',
          display_name: 'All the Self Paced PL Things',
          course_version_path: null,
        },
        {
          key: 'self-paced-pl-physical-computing',
          display_name: 'Teaching Creating Apps with Devices',
          course_version_path: '/courses/self-paced-pl-physical-computing-2023',
        },
        {
          key: 'self-paced-pl-microbit',
          display_name: 'self-paced-pl-microbit',
          course_version_path: '/courses/self-paced-pl-microbit-2023',
        },
        {
          key: 'self-paced-pl-csa',
          display_name: 'CSA Getting Started Modules',
          course_version_path: '/courses/self-paced-pl-csa-2023',
        },
        {
          key: 'self-paced-pl-csp-2021',
          display_name: 'Teaching CS Principles',
          course_version_path: '/courses/self-paced-pl-csp-2022',
        },
        {
          key: 'self-paced-pl-csc',
          display_name: 'Teaching CS Connections',
          course_version_path: '/s/self-paced-pl-csc-2023',
        },
        {
          key: 'self-paced-pl-csd6-2021',
          display_name: 'self-paced-pl-csd6-2021',
          course_version_path: null,
        },
        {
          key: 'self-paced-pl-csd',
          display_name: 'Teaching CS Discoveries',
          course_version_path: '/courses/self-paced-pl-csd-2023',
        },
        {
          key: 'self-paced-pl-csd-2021',
          display_name: 'Teaching CS Discoveries',
          course_version_path: '/courses/self-paced-pl-csd-2022',
        },
        {
          key: 'self-paced-pl-csp',
          display_name: 'self-paced-pl-csp',
          course_version_path: '/courses/self-paced-pl-csp-2023',
        },
        {
          key: 'k5-onlinepd',
          display_name: 'Teaching Computer Science Fundamentals',
          course_version_path: '/s/k5-onlinepd-2023',
        },
        {
          key: 'self-paced-pl-aiml',
          display_name: 'Teaching AI and Machine Learning',
          course_version_path: '/courses/self-paced-pl-aiml-2023',
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
        category: 'Full Courses',
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
        self_paced_professional_learning: 'Teaching AI and Machine Learning',
        professional_learning:
          'https://code.org/educate/professional-learning/middle-high',
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
        category: 'Full Courses',
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
        self_paced_professional_learning: 'Teaching AI and Machine Learning',
        professional_learning:
          'https://code.org/educate/professional-learning/middle-high',
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
