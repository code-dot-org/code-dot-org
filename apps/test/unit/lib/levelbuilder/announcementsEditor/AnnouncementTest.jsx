import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Announcement from '@cdo/apps/lib/levelbuilder/announcementsEditor/Announcement';

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
    onChange = jest.fn();
    onRemove = jest.fn();
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
    expect(
      wrapper.find('.uitest-announcement-dismissible').props().checked
    ).toEqual(true);
  });

  it('uses dismissible value if provided', () => {
    const wrapper = shallow(
      <Announcement
        {...defaultProps}
        announcement={sampleAnnouncementWithDismissibleAndButtonText}
      />
    );
    expect(
      wrapper.find('.uitest-announcement-dismissible').props().checked
    ).toEqual(false);
  });

  it('defaults button text to empty string if not specified', () => {
    const wrapper = shallow(
      <Announcement {...defaultProps} announcement={sampleAnnouncement} />
    );
    expect(
      wrapper.find('.uitest-announcement-button-text').props().value
    ).toEqual('');
  });

  it('uses buttonText value if provided', () => {
    const wrapper = shallow(
      <Announcement
        {...defaultProps}
        announcement={sampleAnnouncementWithDismissibleAndButtonText}
      />
    );
    expect(
      wrapper.find('.uitest-announcement-button-text').props().value
    ).toEqual('Push the button');
  });
});
