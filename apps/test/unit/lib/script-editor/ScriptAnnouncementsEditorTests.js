import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import ScriptAnnouncementsEditor from '@cdo/apps/lib/script-editor/ScriptAnnouncementsEditor';

const sampleAnnouncement = {
  notice: 'This course has recently been updated!',
  details: 'See what changed and how it may affect your classroom.',
  link: 'https://support.code.org/hc/en-us/articles/115001931251',
  type: 'information',
  visibility: 'Teacher-only'
};

const defaultProps = {
  defaultAnnouncements: [],
  inputStyle: {}
};

describe('ScriptAnnouncementsEditor', () => {
  it('renders an Announce when we have an announcement', () => {
    const wrapper = shallow(
      <ScriptAnnouncementsEditor
        {...defaultProps}
        defaultAnnouncements={[sampleAnnouncement]}
      />
    );
    assert.equal(wrapper.find('Announce').length, 1);
  });

  it('shows a preview when we have at least one announcement', () => {
    const wrapper = shallow(
      <ScriptAnnouncementsEditor
        {...defaultProps}
        defaultAnnouncements={[sampleAnnouncement]}
      />
    );
    assert.equal(wrapper.find('ScriptAnnouncements').length, 1);
  });

  it('show no preview if we have no announcements', () => {
    const wrapper = shallow(<ScriptAnnouncementsEditor {...defaultProps} />);
    assert.equal(wrapper.find('ScriptAnnouncements').length, 0);
  });

  it('adds an empty Announce when we click add', () => {
    const wrapper = shallow(<ScriptAnnouncementsEditor {...defaultProps} />);
    wrapper.find('button').simulate('click');
    assert.equal(wrapper.find('Announce').length, 1);
    assert.equal(wrapper.find('Announce').props().announcement.notice, '');
    assert.equal(wrapper.find('Announce').props().announcement.details, '');
    assert.equal(wrapper.find('Announce').props().announcement.link, '');
    assert.equal(
      wrapper.find('Announce').props().announcement.type,
      'information'
    );
    assert.equal(
      wrapper.find('Announce').props().announcement.visibility,
      'Teacher-only'
    );
  });

  it('removes announcements when we click remove', () => {
    const wrapper = shallow(<ScriptAnnouncementsEditor {...defaultProps} />);

    wrapper.find('button').simulate('click');
    // had trouble getting two state updates working, so instead just call .add
    // instead of a second click
    wrapper.instance().add();
    const announce = wrapper.find('Announce');
    assert.equal(announce.length, 2);
    assert.equal(
      announce
        .first()
        .dive()
        .find('button').length,
      1
    );
    assert.equal(
      announce
        .last()
        .dive()
        .find('button').length,
      1
    );

    announce
      .first()
      .dive()
      .find('button')
      .simulate('click');
    assert.equal(wrapper.find('Announce').length, 1);
  });

  it('updates notice', () => {
    const wrapper = shallow(<ScriptAnnouncementsEditor {...defaultProps} />);

    wrapper.find('button').simulate('click');
    wrapper
      .find('Announce')
      .dive()
      .find('input')
      .at(0)
      .simulate('change', {target: {value: 'notice'}});
    assert.equal(wrapper.state('announcements')[0].notice, 'notice');
  });

  it('updates details', () => {
    const wrapper = shallow(<ScriptAnnouncementsEditor {...defaultProps} />);

    wrapper.find('button').simulate('click');
    wrapper
      .find('Announce')
      .dive()
      .find('input')
      .at(1)
      .simulate('change', {target: {value: 'details'}});
    assert.equal(wrapper.state('announcements')[0].details, 'details');
  });

  it('updates link', () => {
    const wrapper = shallow(<ScriptAnnouncementsEditor {...defaultProps} />);

    wrapper.find('button').simulate('click');
    wrapper
      .find('Announce')
      .dive()
      .find('input')
      .at(2)
      .simulate('change', {target: {value: 'link'}});
    assert.equal(wrapper.state('announcements')[0].link, 'link');
  });

  it('updates type', () => {
    const wrapper = shallow(<ScriptAnnouncementsEditor {...defaultProps} />);

    wrapper.find('button').simulate('click');
    wrapper
      .find('Announce')
      .dive()
      .find('.uitest-announcement-type')
      .simulate('change', {target: {value: 'bullhorn'}});
    assert.equal(wrapper.state('announcements')[0].type, 'bullhorn');
  });

  it('updates visibility', () => {
    const wrapper = shallow(<ScriptAnnouncementsEditor {...defaultProps} />);

    wrapper.find('button').simulate('click');
    wrapper
      .find('Announce')
      .dive()
      .find('.uitest-announcement-visibility')
      .simulate('change', {target: {value: 'Student-only'}});
    assert.equal(wrapper.state('announcements')[0].visibility, 'Student-only');
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
      <ScriptAnnouncementsEditor
        {...defaultProps}
        defaultAnnouncements={[oldSampleAnnouncement]}
      />
    );

    assert.equal(wrapper.state('announcements')[0].visibility, undefined);
    wrapper
      .find('Announce')
      .dive()
      .find('.uitest-announcement-visibility')
      .simulate('change', {target: {value: 'Student-only'}});
    assert.equal(wrapper.state('announcements')[0].visibility, 'Student-only');
  });

  it('includes a hidden input with value for server', () => {
    const wrapper = shallow(
      <ScriptAnnouncementsEditor
        {...defaultProps}
        defaultAnnouncements={[sampleAnnouncement]}
      />
    );
    assert.equal(
      wrapper.find('input[type="hidden"]').props().value,
      JSON.stringify([sampleAnnouncement])
    );
  });
});
