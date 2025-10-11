import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AnnouncementsEditor from '@cdo/apps/levelbuilder/announcementsEditor/AnnouncementsEditor';
import * as utils from '@cdo/apps/utils';

const sampleAnnouncement = {
  key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  notice: 'This course has recently been updated!',
  details: 'See what changed and how it may affect your classroom.',
  link: 'https://support.code.org/hc/en-us/articles/115001931251',
  type: 'information',
  visibility: 'Teacher-only',
};

describe('AnnouncementsEditor', () => {
  let defaultProps, updateAnnouncements, createUuid;
  beforeEach(() => {
    updateAnnouncements = jest.fn();
    createUuid = jest
      .spyOn(utils, 'createUuid')
      .mockReturnValue('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    defaultProps = {
      announcements: [],
      inputStyle: {},
      updateAnnouncements,
    };
  });

  afterEach(() => {
    createUuid.restore();
  });

  it('renders an Announce when we have an announcement', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );
    expect(wrapper.find('Announcement').length).toBe(1);
  });

  it('shows a preview for teacher and student when we have at least one announcement', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );
    expect(wrapper.find('Announcements').length).toBe(2);
  });

  it('show no preview if we have no announcements', () => {
    const wrapper = shallow(<AnnouncementsEditor {...defaultProps} />);
    expect(wrapper.find('Announcements').length).toBe(0);
  });

  it('adds an empty Announce when we click add', () => {
    const wrapper = shallow(<AnnouncementsEditor {...defaultProps} />);
    wrapper.find('button').simulate('click');
    expect(updateAnnouncements).toHaveBeenCalledWith([
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        details: '',
        link: '',
        notice: '',
        type: 'information',
        visibility: 'Teacher-only',
        dismissible: true,
        buttonText: '',
      },
    ]);
  });

  it('removes announcements when we click remove', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );
    const announce = wrapper.find('Announcement');
    expect(announce.length).toBe(1);
    expect(announce.first().dive().find('button').length).toBe(1);

    announce.first().dive().find('button').simulate('click');
    expect(updateAnnouncements).toHaveBeenCalledWith([]);
  });

  it('updates notice', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );

    wrapper
      .find('Announcement')
      .dive()
      .find('input')
      .at(0)
      .simulate('change', {target: {value: 'notice'}});
    expect(updateAnnouncements).toHaveBeenCalledWith([
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        details: 'See what changed and how it may affect your classroom.',
        link: 'https://support.code.org/hc/en-us/articles/115001931251',
        notice: 'notice',
        type: 'information',
        visibility: 'Teacher-only',
      },
    ]);
  });

  it('updates details', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );

    wrapper
      .find('Announcement')
      .dive()
      .find('input')
      .at(1)
      .simulate('change', {target: {value: 'details'}});
    expect(updateAnnouncements).toHaveBeenCalledWith([
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        details: 'details',
        link: 'https://support.code.org/hc/en-us/articles/115001931251',
        notice: 'notice',
        type: 'information',
        visibility: 'Teacher-only',
      },
    ]);
  });

  it('updates link', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );

    wrapper
      .find('Announcement')
      .dive()
      .find('input')
      .at(2)
      .simulate('change', {target: {value: 'link'}});
    expect(updateAnnouncements).toHaveBeenCalledWith([
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        details: 'details',
        link: 'link',
        notice: 'notice',
        type: 'information',
        visibility: 'Teacher-only',
      },
    ]);
  });

  it('updates type', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );

    wrapper
      .find('Announcement')
      .dive()
      .find('.uitest-announcement-type')
      .simulate('change', {target: {value: 'bullhorn'}});
    expect(updateAnnouncements).toHaveBeenCalledWith([
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        details: 'details',
        link: 'link',
        notice: 'notice',
        type: 'bullhorn',
        visibility: 'Teacher-only',
      },
    ]);
  });

  it('updates visibility', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );

    wrapper
      .find('Announcement')
      .dive()
      .find('.uitest-announcement-visibility')
      .simulate('change', {target: {value: 'Student-only'}});
    expect(updateAnnouncements).toHaveBeenCalledWith([
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        details: 'details',
        link: 'link',
        notice: 'notice',
        type: 'bullhorn',
        visibility: 'Student-only',
      },
    ]);
  });

  it('updates visibility when no visibility in existing announcement', () => {
    const oldSampleAnnouncement = {
      key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      notice:
        'This announcement was made before students could see announcements',
      details: "So I don't have a visibility",
      link: 'https://support.code.org/hc/en-us/articles/115001931251',
      type: 'information',
    };
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[oldSampleAnnouncement]}
      />
    );

    wrapper
      .find('Announcement')
      .dive()
      .find('.uitest-announcement-visibility')
      .simulate('change', {target: {value: 'Student-only'}});
    expect(updateAnnouncements).toHaveBeenCalledWith([
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        details: "So I don't have a visibility",
        link: 'https://support.code.org/hc/en-us/articles/115001931251',
        notice:
          'This announcement was made before students could see announcements',
        type: 'information',
        visibility: 'Student-only',
      },
    ]);
  });

  it('includes a hidden input with value for server', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );
    expect(wrapper.find('input[type="hidden"]').props().value).toBe(
      JSON.stringify([sampleAnnouncement])
    );
  });
});
