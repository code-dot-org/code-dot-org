import reducer, {
  addAnnouncement,
  VisibilityType,
} from '@cdo/apps/code-studio/announcementsRedux'; // eslint-disable-line no-restricted-imports
import {NotificationType} from '@cdo/apps/templates/Notification';

describe('announcementsRedux', () => {
  it('can add a single teacher announcement', () => {
    const state = reducer(
      undefined,
      addAnnouncement({
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: 'Push the button',
      })
    );

    const expected = [
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: 'Push the button',
      },
    ];
    expect(state).toEqual(expected);
  });
  it('can add a single student announcement', () => {
    const state = reducer(
      undefined,
      addAnnouncement({
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.student,
        dismissible: true,
        buttonText: 'Push the button',
      })
    );

    const expected = [
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.student,
        dismissible: true,
        buttonText: 'Push the button',
      },
    ];
    expect(state).toEqual(expected);
  });
  it('can add a single teacher and student announcement', () => {
    const state = reducer(
      undefined,
      addAnnouncement({
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacherAndStudent,
        dismissible: true,
        buttonText: 'Push the button',
      })
    );

    const expected = [
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacherAndStudent,
        dismissible: true,
        buttonText: 'Push the button',
      },
    ];
    expect(state).toEqual(expected);
  });

  it('can add two teacher announcements', () => {
    const state1 = reducer(
      undefined,
      addAnnouncement({
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: 'Push the button',
      })
    );
    const state = reducer(
      state1,
      addAnnouncement({
        key: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        notice: 'Announce2',
        details: 'details2',
        link: '/link/2',
        type: NotificationType.bullhorn,
        visibility: VisibilityType.teacher,
        dismissible: false,
        buttonText: 'Do you like this button?',
      })
    );

    const expected = [
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: 'Push the button',
      },
      {
        key: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        notice: 'Announce2',
        details: 'details2',
        link: '/link/2',
        type: NotificationType.bullhorn,
        visibility: VisibilityType.teacher,
        dismissible: false,
        buttonText: 'Do you like this button?',
      },
    ];
    expect(state).toEqual(expected);
  });
  it('can add a teacher and a student announcement', () => {
    const state1 = reducer(
      undefined,
      addAnnouncement({
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: 'Push the button',
      })
    );
    const state = reducer(
      state1,
      addAnnouncement({
        key: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        notice: 'Announce2',
        details: 'details2',
        link: '/link/2',
        type: NotificationType.bullhorn,
        visibility: VisibilityType.student,
        dismissible: false,
        buttonText: 'Do you like this button?',
      })
    );

    const expected = [
      {
        key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: 'Push the button',
      },
      {
        key: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        notice: 'Announce2',
        details: 'details2',
        link: '/link/2',
        type: NotificationType.bullhorn,
        visibility: VisibilityType.student,
        dismissible: false,
        buttonText: 'Do you like this button?',
      },
    ];
    expect(state).toEqual(expected);
  });
});
