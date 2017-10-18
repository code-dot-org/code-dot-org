import { assert } from 'chai';
import reducer, {
  addAnnouncement
} from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import { NotificationType } from '@cdo/apps/templates/Notification';

describe('scriptAnnouncementsRedux', () => {
  it('can add a single announcement', () => {
    const state = reducer(undefined, addAnnouncement('Hey you', 'Look what I have to say',
      '/very/interesting', NotificationType.information));

    const expected = [{
      notice: 'Hey you',
      details: 'Look what I have to say',
      link: '/very/interesting',
      type: NotificationType.information
    }];
    assert.deepEqual(state, expected);
  });

  it('can add a second announcement', () => {
    const state1 = reducer(undefined, addAnnouncement('Hey you', 'Look what I have to say',
      '/very/interesting', NotificationType.information));
    const state = reducer(state1, addAnnouncement('Announce2', 'details2',
      '/link/2', NotificationType.bullhorn));

    const expected = [
      {
        notice: 'Hey you',
        details: 'Look what I have to say',
        link: '/very/interesting',
        type: NotificationType.information
      },
      {
        notice: 'Announce2',
        details: 'details2',
        link: '/link/2',
        type: NotificationType.bullhorn
      }
    ];
    assert.deepEqual(state, expected);
  });
});
