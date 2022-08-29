import {assert} from 'chai';
import reducer, {
  addAnnouncement,
  VisibilityType
} from '@cdo/apps/code-studio/announcementsRedux';
import {NotificationType} from '@cdo/apps/templates/Notification';

describe('announcementsRedux', () => {
  it('can add a single teacher announcement', () => {
    const state = reducer(
      undefined,
      addAnnouncement(
        'Hey you',
        'Look what I have to say',
        '/very/interesting',
        NotificationType.information,
        VisibilityType.teacher,
        true,
        'Push the button'
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: 'Push the button'
      }
    ];
    assert.deepEqual(state, expected);
  });
  it('can add a single student announcement', () => {
    const state = reducer(
      undefined,
      addAnnouncement(
        'Hey you',
        'Look what I have to say',
        '/very/interesting',
        NotificationType.information,
        VisibilityType.student,
        true,
        'Push the button'
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.student,
        dismissible: true,
        buttonText: 'Push the button'
      }
    ];
    assert.deepEqual(state, expected);
  });
  it('can add a single teacher and student announcement', () => {
    const state = reducer(
      undefined,
      addAnnouncement(
        'Hey you',
        'Look what I have to say',
        '/very/interesting',
        NotificationType.information,
        VisibilityType.teacherAndStudent,
        true,
        'Push the button'
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacherAndStudent,
        dismissible: true,
        buttonText: 'Push the button'
      }
    ];
    assert.deepEqual(state, expected);
  });

  it('can add two teacher announcements', () => {
    const state1 = reducer(
      undefined,
      addAnnouncement(
        'Hey you',
        'Look what I have to say',
        '/very/interesting',
        NotificationType.information,
        VisibilityType.teacher,
        true,
        'Push the button'
      )
    );
    const state = reducer(
      state1,
      addAnnouncement(
        'Announce2',
        'details2',
        '/link/2',
        NotificationType.bullhorn,
        VisibilityType.teacher,
        false,
        'Do you like this button?'
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: 'Push the button'
      },
      {
        notice: 'Announce2',
        details: 'details2',
        link: '/link/2',
        type: NotificationType.bullhorn,
        visibility: VisibilityType.teacher,
        dismissible: false,
        buttonText: 'Do you like this button?'
      }
    ];
    assert.deepEqual(state, expected);
  });
  it('can add a teacher and a student announcement', () => {
    const state1 = reducer(
      undefined,
      addAnnouncement(
        'Hey you',
        'Look what I have to say',
        '/very/interesting',
        NotificationType.information,
        VisibilityType.teacher,
        true,
        'Push the button'
      )
    );
    const state = reducer(
      state1,
      addAnnouncement(
        'Announce2',
        'details2',
        '/link/2',
        NotificationType.bullhorn,
        VisibilityType.student,
        false,
        'Do you like this button?'
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: 'Push the button'
      },
      {
        notice: 'Announce2',
        details: 'details2',
        link: '/link/2',
        type: NotificationType.bullhorn,
        visibility: VisibilityType.student,
        dismissible: false,
        buttonText: 'Do you like this button?'
      }
    ];
    assert.deepEqual(state, expected);
  });
});
