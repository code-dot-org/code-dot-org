import {getLabViewPageAction} from '@cdo/apps/lab2/utils/getLabViewPageAction';

// getLabViewPageAction reads window.location.pathname; replaceState is the
// only way to change it in jsdom.
const setPathname = (pathname: string) =>
  window.history.replaceState({}, '', pathname);

describe('getLabViewPageAction', () => {
  const originalPathname = window.location.pathname;

  afterEach(() => setPathname(originalPathname));

  describe('project URLs', () => {
    it('returns the page action when the URL has one', () => {
      setPathname('/projects/pythonlab/abc123/view');
      expect(getLabViewPageAction()).toBe('view');
    });

    it('returns edit for an edit URL', () => {
      setPathname('/projects/pythonlab/abc123/edit');
      expect(getLabViewPageAction()).toBe('edit');
    });

    it('returns share when the URL has no page action', () => {
      setPathname('/projects/pythonlab/abc123');
      expect(getLabViewPageAction()).toBe('share');
    });

    it('returns share when the URL has a trailing slash', () => {
      setPathname('/projects/pythonlab/abc123/');
      expect(getLabViewPageAction()).toBe('share');
    });

    it('ignores segments after the page action', () => {
      setPathname('/projects/pythonlab/abc123/view/extra');
      expect(getLabViewPageAction()).toBe('view');
    });

    it('ignores the query string and fragment', () => {
      setPathname('/projects/pythonlab/abc123/view?foo=bar#anchor');
      expect(getLabViewPageAction()).toBe('view');
    });
  });

  describe('level URLs', () => {
    it('returns level for a course/unit/lesson/level URL', () => {
      setPathname('/courses/allthethingscourse/units/1/lessons/51/levels/1');
      expect(getLabViewPageAction()).toBe('level');
    });

    it('returns level for a standalone level URL', () => {
      setPathname('/levels/12345');
      expect(getLabViewPageAction()).toBe('level');
    });

    it('returns level for a standalone level URL with extra segments', () => {
      setPathname('/levels/12345/page/2');
      expect(getLabViewPageAction()).toBe('level');
    });
  });

  describe('other URLs', () => {
    it('returns undefined for a course URL that stops short of a level', () => {
      setPathname('/courses/allthethingscourse/units/1/lessons/51');
      expect(getLabViewPageAction()).toBeUndefined();
    });

    it('returns undefined when the course URL segments are out of order', () => {
      setPathname('/courses/allthethingscourse/lessons/51/units/1/levels/1');
      expect(getLabViewPageAction()).toBeUndefined();
    });

    it('returns undefined for the root URL', () => {
      setPathname('/');
      expect(getLabViewPageAction()).toBeUndefined();
    });

    it('returns undefined for an unrelated URL', () => {
      setPathname('/home');
      expect(getLabViewPageAction()).toBeUndefined();
    });
  });
});
