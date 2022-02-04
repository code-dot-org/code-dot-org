import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import CourseOfferingEditor from '@cdo/apps/lib/levelbuilder/CourseOfferingEditor';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

describe('CourseOfferingEditor', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      initialCourseOffering: {
        key: 'test-course-offering',
        is_featured: false,
        category: 'Other',
        display_name: 'Course Offering 1'
      }
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
        is_featured: true
      };
      server.respondWith('PUT', '/course_offerings/test-course-offering', [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
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
        returnData
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
        is_featured: true
      };

      server.respondWith('PUT', '/course_offerings/test-course-offering', [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
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
        returnData
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
