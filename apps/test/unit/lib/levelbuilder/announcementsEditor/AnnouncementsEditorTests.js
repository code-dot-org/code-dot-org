import React from 'react';
import {shallow} from 'enzyme';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';
import {expect, assert} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';

const sampleAnnouncement = {
  notice: 'This course has recently been updated!',
  details: 'See what changed and how it may affect your classroom.',
  link: 'https://support.code.org/hc/en-us/articles/115001931251',
  type: 'information',
  visibility: 'Teacher-only'
};

describe('AnnouncementsEditor', () => {
  let defaultProps, updateAnnouncements;
  beforeEach(() => {
    updateAnnouncements = sinon.spy();
    defaultProps = {
      announcements: [],
      inputStyle: {},
      updateAnnouncements
    };
  });

  it('renders an Announce when we have an announcement', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );
    assert.equal(wrapper.find('Announcement').length, 1);
  });

  it('shows a preview for teacher and student when we have at least one announcement', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );
    assert.equal(wrapper.find('Announcements').length, 2);
  });

  it('show no preview if we have no announcements', () => {
    const wrapper = shallow(<AnnouncementsEditor {...defaultProps} />);
    assert.equal(wrapper.find('Announcements').length, 0);
  });

  it('adds an empty Announce when we click add', () => {
    const wrapper = shallow(<AnnouncementsEditor {...defaultProps} />);
    wrapper.find('button').simulate('click');
    expect(updateAnnouncements).to.have.been.calledWith([
      {
        details: '',
        link: '',
        notice: '',
        type: 'information',
        visibility: 'Teacher-only'
      }
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
    assert.equal(announce.length, 1);
    assert.equal(
      announce
        .first()
        .dive()
        .find('button').length,
      1
    );

    announce
      .first()
      .dive()
      .find('button')
      .simulate('click');
    expect(updateAnnouncements).to.have.been.calledWith([]);
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
    expect(updateAnnouncements).to.have.been.calledWith([
      {
        details: 'See what changed and how it may affect your classroom.',
        link: 'https://support.code.org/hc/en-us/articles/115001931251',
        notice: 'notice',
        type: 'information',
        visibility: 'Teacher-only'
      }
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
    expect(updateAnnouncements).to.have.been.calledWith([
      {
        details: 'details',
        link: 'https://support.code.org/hc/en-us/articles/115001931251',
        notice: 'notice',
        type: 'information',
        visibility: 'Teacher-only'
      }
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
    expect(updateAnnouncements).to.have.been.calledWith([
      {
        details: 'details',
        link: 'link',
        notice: 'notice',
        type: 'information',
        visibility: 'Teacher-only'
      }
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
    expect(updateAnnouncements).to.have.been.calledWith([
      {
        details: 'details',
        link: 'link',
        notice: 'notice',
        type: 'bullhorn',
        visibility: 'Teacher-only'
      }
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
    expect(updateAnnouncements).to.have.been.calledWith([
      {
        details: 'details',
        link: 'link',
        notice: 'notice',
        type: 'bullhorn',
        visibility: 'Student-only'
      }
    ]);
  });

  it('updates visibility when no visibility in existing announcement', () => {
    const oldSampleAnnouncement = {
      notice:
        'This announcement was made before students could see announcements',
      details: "So I don't have a visibility",
      link: 'https://support.code.org/hc/en-us/articles/115001931251',
      type: 'information'
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
    expect(updateAnnouncements).to.have.been.calledWith([
      {
        details: "So I don't have a visibility",
        link: 'https://support.code.org/hc/en-us/articles/115001931251',
        notice:
          'This announcement was made before students could see announcements',
        type: 'information',
        visibility: 'Student-only'
      }
    ]);
  });

  it('includes a hidden input with value for server', () => {
    const wrapper = shallow(
      <AnnouncementsEditor
        {...defaultProps}
        announcements={[sampleAnnouncement]}
      />
    );
    assert.equal(
      wrapper.find('input[type="hidden"]').props().value,
      JSON.stringify([sampleAnnouncement])
    );
  });
});
