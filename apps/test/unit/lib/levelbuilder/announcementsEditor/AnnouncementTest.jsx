import React from 'react';
import {shallow} from 'enzyme';
import Announcement from '@cdo/apps/lib/levelbuilder/announcementsEditor/Announcement';
import {assert} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';

const sampleAnnouncement = {
  key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  notice: 'This course has recently been updated!',
  details: 'See what changed and how it may affect your classroom.',
  link: 'https://support.code.org/hc/en-us/articles/115001931251',
  type: 'information',
  visibility: 'Teacher-only',
};

const sampleAnnouncementWithDismissibleAndButtonText = {
  key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  notice: 'This course has recently been updated!',
  details: 'See what changed and how it may affect your classroom.',
  link: 'https://support.code.org/hc/en-us/articles/115001931251',
  type: 'information',
  visibility: 'Teacher-only',
  dismissible: false,
  buttonText: 'Push the button',
};

describe('Announcement', () => {
  let defaultProps, onChange, onRemove;
  beforeEach(() => {
    onChange = sinon.spy();
    onRemove = sinon.spy();
    defaultProps = {
      announcement: sampleAnnouncement,
      inputStyle: {},
      index: 1,
      onRemove,
      onChange,
    };
  });

  it('defaults dismissible to true if not specified', () => {
    const wrapper = shallow(
      <Announcement {...defaultProps} announcement={sampleAnnouncement} />
    );
    assert.equal(
      wrapper.find('.uitest-announcement-dismissible').props().checked,
      true
    );
  });

  it('uses dismissible value if provided', () => {
    const wrapper = shallow(
      <Announcement
        {...defaultProps}
        announcement={sampleAnnouncementWithDismissibleAndButtonText}
      />
    );
    assert.equal(
      wrapper.find('.uitest-announcement-dismissible').props().checked,
      false
    );
  });

  it('defaults button text to empty string if not specified', () => {
    const wrapper = shallow(
      <Announcement {...defaultProps} announcement={sampleAnnouncement} />
    );
    assert.equal(
      wrapper.find('.uitest-announcement-button-text').props().value,
      ''
    );
  });

  it('uses buttonText value if provided', () => {
    const wrapper = shallow(
      <Announcement
        {...defaultProps}
        announcement={sampleAnnouncementWithDismissibleAndButtonText}
      />
    );
    assert.equal(
      wrapper.find('.uitest-announcement-button-text').props().value,
      'Push the button'
    );
  });
});
