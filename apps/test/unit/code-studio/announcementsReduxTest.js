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
        VisibilityType.teacher
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher
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
        VisibilityType.student
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.student
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
        VisibilityType.teacherAndStudent
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacherAndStudent
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
        VisibilityType.teacher
      )
    );
    const state = reducer(
      state1,
      addAnnouncement(
        'Announce2',
        'details2',
        '/link/2',
        NotificationType.bullhorn,
        VisibilityType.teacher
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher
      },
      {
        notice: 'Announce2',
        details: 'details2',
        link: '/link/2',
        type: NotificationType.bullhorn,
        visibility: VisibilityType.teacher
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
        VisibilityType.teacher
      )
    );
    const state = reducer(
      state1,
      addAnnouncement(
        'Announce2',
        'details2',
        '/link/2',
        NotificationType.bullhorn,
        VisibilityType.student
      )
    );

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information,
        visibility: VisibilityType.teacher
      },
      {
        notice: 'Announce2',
        details: 'details2',
        link: '/link/2',
        type: NotificationType.bullhorn,
        visibility: VisibilityType.student
      }
    ];
    assert.deepEqual(state, expected);
  });
});
