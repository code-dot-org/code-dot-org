import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import TutorDeepDiveEditor from '@cdo/apps/levelbuilder/lesson-editor/TutorDeepDiveEditor';

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('TutorDeepDiveEditor', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      lessonId: 42,
      objectives: [{id: 1, description: 'Objective one', key: 'obj-1'}],
      initialVideos: [
        {
          id: 7,
          key: 'video-a',
          description: 'First video',
          audience: 'Student',
          s3Uri: 's3://b/video-a.json',
          objectiveIds: [1],
        },
      ],
    };
  });

  let fetchSpy, confirmSpy, alertSpy;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a row per video', () => {
    const wrapper = mount(<TutorDeepDiveEditor {...defaultProps} />);
    // one header row + one video row
    expect(wrapper.find('tbody tr').length).toBe(1);
    expect(wrapper.text()).toContain('video-a');
    expect(wrapper.text()).toContain('First video');
  });

  it('lists the associated objective descriptions, not the audience', () => {
    const wrapper = mount(<TutorDeepDiveEditor {...defaultProps} />);
    // objective descriptions are resolved from ids and listed
    expect(wrapper.find('tbody li').map(li => li.text())).toEqual([
      'Objective one',
    ]);
    // audience column has been removed
    expect(wrapper.text()).not.toContain('Student');
  });

  it('shows "None" when a video has no associated objectives', () => {
    const video = {...defaultProps.initialVideos[0], objectiveIds: []};
    const wrapper = mount(
      <TutorDeepDiveEditor {...defaultProps} initialVideos={[video]} />
    );
    expect(wrapper.find('tbody li').length).toBe(0);
    expect(wrapper.find('tbody').text()).toContain('None');
  });

  it('renders an empty state with no videos', () => {
    const wrapper = mount(
      <TutorDeepDiveEditor {...defaultProps} initialVideos={[]} />
    );
    expect(wrapper.text()).toContain('No videos yet.');
  });

  it('opens the dialog to add a video', () => {
    const wrapper = mount(<TutorDeepDiveEditor {...defaultProps} />);
    expect(wrapper.find('TutorVideoDialog').prop('isOpen')).toBe(false);

    wrapper.find('button').last().simulate('click');
    wrapper.update();

    expect(wrapper.find('TutorVideoDialog').prop('isOpen')).toBe(true);
    // add mode passes no video
    expect(wrapper.find('TutorVideoDialog').prop('video')).toBe(null);
  });

  it('issues a DELETE for the video scoped to the lesson', async () => {
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    fetchSpy = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({deleted: true}),
    });

    const wrapper = mount(<TutorDeepDiveEditor {...defaultProps} />);

    // the trash button is the second action button in the row
    wrapper.find('tbody button').at(1).prop('onClick')();
    await flushPromises();

    expect(confirmSpy).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith(
      '/json_videos/video-a?lesson_id=42',
      expect.objectContaining({method: 'DELETE'})
    );
    // A clean (deleted) response takes the removal path, not the error path.
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('does not call the server when removal is not confirmed', () => {
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    fetchSpy = jest.spyOn(window, 'fetch');

    const wrapper = mount(<TutorDeepDiveEditor {...defaultProps} />);
    wrapper.find('tbody button').at(1).prop('onClick')();

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
