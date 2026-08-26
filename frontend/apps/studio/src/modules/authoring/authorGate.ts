import {useAuth} from '@/modules/auth';

/**
 * Whether the current user gets author affordances. Conceptually
 * `isLevelbuilder || admin`; the standalone (MSW) prototype has no real
 * signed-in levelbuilder, so mock/dev mode acts as the development override
 * the prototype allows. Author Mode is a UX affordance on top of the learner
 * experience — this gate hides affordances, it does not switch component trees.
 */
export function useCanAuthor(): boolean {
  const auth = useAuth();
  if (auth.status === 'signed-in') {
    return auth.is_levelbuilder || auth.user_type === 'admin';
  }
  return import.meta.env.VITE_API_MODE === 'msw';
}
