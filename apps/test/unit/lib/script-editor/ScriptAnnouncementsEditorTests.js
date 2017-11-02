import React from 'react';
import { shallow, mount } from 'enzyme';
import { assert } from '../../../util/configuredChai';
import ScriptAnnouncementsEditor from '@cdo/apps/lib/script-editor/ScriptAnnouncementsEditor';

const sampleAnnouncement = {
  notice: "This course has recently been updated!",
  details: "See what changed and how it may affect your classroom.",
  link: "https://support.code.org/hc/en-us/articles/115001931251",
  type: "information"
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
    const wrapper = shallow(
      <ScriptAnnouncementsEditor
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('ScriptAnnouncements').length, 0);
  });

  it('adds an empty Announce when we click add', () => {
    const wrapper = shallow(
      <ScriptAnnouncementsEditor
        {...defaultProps}
      />
    );
    wrapper.find('button').simulate('click');
    assert.equal(wrapper.find('Announce').length, 1);
    assert.equal(wrapper.find('Announce').props().announcement.notice, '');
    assert.equal(wrapper.find('Announce').props().announcement.details, '');
    assert.equal(wrapper.find('Announce').props().announcement.link, '');
    assert.equal(wrapper.find('Announce').props().announcement.type, 'information');
  });

  it('removes announcements when we click remove', () => {
    const wrapper = mount(
      <ScriptAnnouncementsEditor
        {...defaultProps}
      />
    );

    wrapper.find('button').simulate('click');
    // had trouble getting two state updates working, so instead just call .add
    // instead of a second click
    wrapper.instance().add();
    assert.equal(wrapper.find('Announce').length, 2);
    assert.equal(wrapper.find('Announce button').length, 2);
    wrapper.find('Announce button').first().simulate('click');
    assert.equal(wrapper.find('Announce').length, 1);
  });

  it('updates notice', () => {
    const wrapper = mount(
      <ScriptAnnouncementsEditor
        {...defaultProps}
      />
    );

    wrapper.find('button').simulate('click');
    wrapper.find('Announce input').at(0).simulate('change', { target: { value: 'notice' }});
    assert.equal(wrapper.state('announcements')[0].notice, 'notice');
  });

  it('updates details', () => {
    const wrapper = mount(
      <ScriptAnnouncementsEditor
        {...defaultProps}
      />
    );

    wrapper.find('button').simulate('click');
    wrapper.find('Announce input').at(1).simulate('change', { target: { value: 'details' }});
    assert.equal(wrapper.state('announcements')[0].details, 'details');
  });

  it('updates link', () => {
    const wrapper = mount(
      <ScriptAnnouncementsEditor
        {...defaultProps}
      />
    );

    wrapper.find('button').simulate('click');
    wrapper.find('Announce input').at(2).simulate('change', { target: { value: 'link' }});
    assert.equal(wrapper.state('announcements')[0].link, 'link');
  });

  it('updates type', () => {
    const wrapper = mount(
      <ScriptAnnouncementsEditor
        {...defaultProps}
      />
    );

    wrapper.find('button').simulate('click');
    wrapper.find('Announce select').simulate('change', { target: { value: 'bullhorn' }});
    assert.equal(wrapper.state('announcements')[0].type, 'bullhorn');
  });

  it('includes a hidden input with value for server', () => {
    const wrapper = shallow(
      <ScriptAnnouncementsEditor
        {...defaultProps}
        defaultAnnouncements={[sampleAnnouncement]}
      />
    );
    assert.equal(wrapper.find('input[type="hidden"]').props().value,
      JSON.stringify([sampleAnnouncement]));
  });
});
