import {Tour} from 'shepherd.js';

import {
  createTeacherPanelCalloutSteps,
  recordTeacherPanelCalloutSeen,
  TEACHER_PANEL_CALLOUT_SEEN_URL,
} from '@cdo/apps/aiTeacherDrawer/teacherPanelCallout';
import HttpClient from '@cdo/apps/util/HttpClient';

const fakeTour = {complete: jest.fn()} as unknown as Tour;

describe('teacherPanelCallout', () => {
  describe('createTeacherPanelCalloutSteps', () => {
    it('is a single step carrying the approved wording', () => {
      const steps = createTeacherPanelCalloutSteps(fakeTour);

      expect(steps).toHaveLength(1);
      expect(steps[0].text).toBe(
        'The Teacher Panel is now part of Teaching Assistant! Open TA and go ' +
          'to Roster to see a list of students in your class section and view ' +
          'their work.'
      );
    });

    it('points at the handle that replaced the teacher panel', () => {
      const [step] = createTeacherPanelCalloutSteps(fakeTour);

      expect(step.attachTo).toEqual({
        element: '.teacher-panel .show-handle',
        on: 'left',
      });
    });

    it('dismisses to nothing further, being one step', () => {
      const [step] = createTeacherPanelCalloutSteps(fakeTour);

      expect(step.buttons).toHaveLength(1);
      step.buttons?.[0].action?.call(fakeTour);
      expect(fakeTour.complete).toHaveBeenCalled();
    });
  });

  describe('recordTeacherPanelCalloutSeen', () => {
    it('records against the user so other devices stay quiet', async () => {
      const post = jest
        .spyOn(HttpClient, 'post')
        .mockResolvedValue({} as Response);

      recordTeacherPanelCalloutSeen();

      expect(post).toHaveBeenCalledWith(
        TEACHER_PANEL_CALLOUT_SEEN_URL,
        undefined,
        true
      );
      post.mockRestore();
    });

    it('leaves the callout dismissed if the request fails', async () => {
      const post = jest
        .spyOn(HttpClient, 'post')
        .mockRejectedValue(new Error('offline'));
      const logged = jest.spyOn(console, 'error').mockImplementation(() => {});

      recordTeacherPanelCalloutSeen();
      await Promise.resolve();

      expect(logged).toHaveBeenCalled();
      post.mockRestore();
      logged.mockRestore();
    });
  });
});
