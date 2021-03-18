import {assert} from '../util/deprecatedChai';
var testUtils = require('./../util/testUtils');

import instructions, {
  toggleInstructionsCollapsed,
  setInstructionsRenderedHeight,
  setInstructionsMaxHeightAvailable,
  setInstructionsMaxHeightNeeded,
  determineInstructionsConstants
} from '@cdo/apps/redux/instructions';

const ENGLISH_LOCALE = 'en_us';

describe('instructions', () => {
  testUtils.setExternalGlobals();

  describe('instructions reducer', () => {
    var reducer = instructions;

    it('starts out uncollapsed', () => {
      var state = reducer(undefined, {});
      assert.strictEqual(state.isCollapsed, false);
    });

    it('toggles isCollapsed', () => {
      var initialState, newState;

      // start collapsed
      initialState = {
        isCollapsed: false,
        longInstructions: 'foo'
      };
      newState = reducer(initialState, toggleInstructionsCollapsed());
      assert.strictEqual(newState.isCollapsed, true);

      // start uncollapsed
      initialState = {
        isCollapsed: true,
        longInstructions: 'foo'
      };
      newState = reducer(initialState, toggleInstructionsCollapsed());
      assert.strictEqual(newState.isCollapsed, false);
    });

    it('will collapse even if no long instructions', () => {
      var initialState, newState;

      // start collapsed
      initialState = {
        isCollapsed: false,
        shortInstructions: 'short',
        longInstructions: undefined
      };
      newState = reducer(initialState, toggleInstructionsCollapsed());
      assert.strictEqual(newState.isCollapsed, true);
    });

    it('setInstructionsRenderedHeight updates rendered and expanded height if not collapsed', () => {
      var initialState, newState;
      initialState = {
        isCollapsed: false,
        renderedHeight: 0,
        expandedHeight: 0,
        allowResize: true
      };
      newState = reducer(initialState, setInstructionsRenderedHeight(200));
      assert.deepEqual(newState, {
        isCollapsed: false,
        renderedHeight: 200,
        expandedHeight: 200,
        allowResize: true
      });
    });

    it('setInstructionsRenderedHeight does not update without allowResize', () => {
      var initialState, newState;
      initialState = {
        isCollapsed: false,
        renderedHeight: 0,
        expandedHeight: 0
      };
      newState = reducer(initialState, setInstructionsRenderedHeight(200));
      assert.deepEqual(newState, {
        isCollapsed: false,
        renderedHeight: 0,
        expandedHeight: 0
      });
    });

    it('setInstructionsRenderedHeight updates only rendered height if collapsed', () => {
      var initialState, newState;
      initialState = {
        isCollapsed: true,
        renderedHeight: 0,
        expandedHeight: 0,
        allowResize: true
      };
      newState = reducer(initialState, setInstructionsRenderedHeight(200));
      assert.deepEqual(newState, {
        isCollapsed: true,
        renderedHeight: 200,
        expandedHeight: 0,
        allowResize: true
      });
    });

    it('setInstructionsMaxHeightNeeded sets maxNeededHeight', () => {
      var initialState, newState;
      initialState = {
        maxNeededHeight: 0,
        allowResize: true
      };
      newState = reducer(initialState, setInstructionsMaxHeightNeeded(200));
      assert.deepEqual(newState, {
        maxNeededHeight: 200,
        allowResize: true
      });
    });

    it('setInstructionsMaxHeightAvailable updates maxAvailableHeight', () => {
      var initialState, newState;
      initialState = {
        maxAvailableHeight: Infinity,
        renderedHeight: 0,
        expandedHeight: 0,
        allowResize: true
      };
      newState = reducer(initialState, setInstructionsMaxHeightAvailable(300));
      assert.deepEqual(newState, {
        maxAvailableHeight: 300,
        renderedHeight: 0,
        expandedHeight: 0,
        allowResize: true
      });
    });

    it('setInstructionsMaxHeightAvailable adjusts rendered/expanded height if necessary', () => {
      var initialState, newState;
      initialState = {
        maxAvailableHeight: Infinity,
        renderedHeight: 400,
        expandedHeight: 400,
        allowResize: true
      };
      newState = reducer(initialState, setInstructionsMaxHeightAvailable(300));
      assert.deepEqual(newState, {
        maxAvailableHeight: 300,
        renderedHeight: 300,
        expandedHeight: 300,
        allowResize: true
      });
    });
  });

  describe('determineInstructionsConstants', () => {
    describe('CSP mode', () => {
      const noInstructionsWhenCollapsed = true;
      const showInstructionsInTopPane = true;
      const hasContainedLevels = false;
      const overlayVisible = false;

      it('sets longInstructions to markdown instructions regardless of locale', () => {
        const locales = ['fr-fr', ENGLISH_LOCALE, undefined];
        const results = locales.map(locale =>
          determineInstructionsConstants({
            level: {
              shortInstructions: 'non-markdown',
              longInstructions: 'markdown'
            },
            skin: {},
            locale,
            noInstructionsWhenCollapsed,
            showInstructionsInTopPane,
            hasContainedLevels,
            overlayVisible
          })
        );

        results.forEach(result => {
          assert.equal(result.longInstructions, 'markdown');
        });
      });

      it('sets longInstructions to be non-markdown instructions if no markdown instructions given', () => {
        const result = determineInstructionsConstants({
          level: {
            shortInstructions: 'non-markdown',
            longInstructions: undefined
          },
          skin: {},
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          hasContainedLevels,
          overlayVisible
        });

        assert.equal(result.longInstructions, 'non-markdown');
      });

      it('never sets shortInstructions', () => {
        // only given non-markdown
        const result = determineInstructionsConstants({
          level: {
            shortInstructions: 'non-markdown',
            longInstructions: undefined
          },
          skin: {},
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          hasContainedLevels,
          overlayVisible
        });

        assert.equal(result.shortInstructions, undefined);

        // only given markdown
        const result2 = determineInstructionsConstants({
          level: {
            shortInstructions: undefined,
            longInstructions: 'markdown'
          },
          skin: {},
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          hasContainedLevels,
          overlayVisible
        });

        assert.equal(result2.shortInstructions, undefined);

        // given both
        const result3 = determineInstructionsConstants({
          level: {
            shortInstructions: 'non-markdown',
            longInstructions: 'markdown'
          },
          skin: {},
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          hasContainedLevels,
          overlayVisible
        });

        assert.equal(result3.shortInstructions, undefined);
      });
    });

    describe('CSF mode', () => {
      const noInstructionsWhenCollapsed = false;
      const showInstructionsInTopPane = true;
      const hasContainedLevels = false;
      const overlayVisible = false;

      it('sets long and short instructions for all locales', () => {
        // en_us and undefined should both be treated as english
        ['en_us', undefined, 'fr_fr'].forEach(locale => {
          const result = determineInstructionsConstants({
            level: {
              shortInstructions: 'non-markdown',
              longInstructions: 'markdown'
            },
            skin: {},
            locale,
            noInstructionsWhenCollapsed,
            showInstructionsInTopPane,
            hasContainedLevels
          });
          assert.deepEqual(result, {
            noInstructionsWhenCollapsed,
            shortInstructions: 'non-markdown',
            shortInstructions2: undefined,
            longInstructions: 'markdown',
            dynamicInstructions: undefined,
            hasContainedLevels,
            overlayVisible,
            teacherMarkdown: undefined,
            levelVideos: undefined,
            mapReference: undefined,
            referenceLinks: undefined
          });
        });
      });

      it(
        'does not set long instructions if identical to short-instructions, and ' +
          'showInstructionsInTopPane is true',
        () => {
          const result = determineInstructionsConstants({
            level: {
              shortInstructions: 'non-markdown',
              longInstructions: 'non-markdown'
            },
            skin: {},
            ENGLISH_LOCALE,
            noInstructionsWhenCollapsed,
            showInstructionsInTopPane,
            hasContainedLevels,
            overlayVisible
          });
          assert.deepEqual(result, {
            noInstructionsWhenCollapsed,
            shortInstructions: 'non-markdown',
            shortInstructions2: undefined,
            longInstructions: undefined,
            dynamicInstructions: undefined,
            hasContainedLevels,
            overlayVisible,
            teacherMarkdown: undefined,
            levelVideos: undefined,
            mapReference: undefined,
            referenceLinks: undefined
          });
        }
      );

      it('sets long instructions if we have an inputOutputTable', () => {
        const inputOutputTable = [[15, 5], [20, 10]];
        const result = determineInstructionsConstants({
          level: {
            shortInstructions: 'non-markdown',
            longInstructions: undefined,
            inputOutputTable
          },
          skin: {},
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          hasContainedLevels,
          overlayVisible
        });
        assert.equal(result.longInstructions, 'non-markdown');

        const result2 = determineInstructionsConstants({
          level: {
            shortInstructions: 'non-markdown',
            longInstructions: 'markdown',
            inputOutputTable
          },
          skin: {},
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          hasContainedLevels,
          overlayVisible
        });
        assert.equal(result2.longInstructions, 'markdown');
      });

      it('substitutes images in instructions', () => {
        const result = determineInstructionsConstants({
          level: {
            shortInstructions: 'Instructions with [image1]',
            instructions2: 'Instructions with [image2]',
            longInstructions: undefined
          },
          skin: {
            instructions2ImageSubstitutions: {
              image1: '/image1.png',
              image2: '/image2.png'
            }
          },
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          overlayVisible
        });

        assert(
          /image1\.png/.test(result.shortInstructions),
          'image 1 is replaced'
        );
        assert(
          /image2\.png/.test(result.shortInstructions2),
          'image 2 is replaced'
        );
      });

      it('instructions outputs levelVideos data when it is associated with the given level', () => {
        const result = determineInstructionsConstants({
          level: {
            levelVideos: ['notEmpty']
          },
          skin: {},
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          overlayVisible
        });

        assert.deepEqual(result, {
          noInstructionsWhenCollapsed: false,
          overlayVisible: false,
          shortInstructions: undefined,
          shortInstructions2: undefined,
          longInstructions: undefined,
          dynamicInstructions: undefined,
          teacherMarkdown: undefined,
          hasContainedLevels: undefined,
          levelVideos: ['notEmpty'],
          mapReference: undefined,
          referenceLinks: undefined
        });
      });

      it('instructions outputs mapReference data when it is associated with the given level', () => {
        const result = determineInstructionsConstants({
          level: {
            mapReference: '/test/abc.html'
          },
          skin: {},
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          overlayVisible
        });

        assert.deepEqual(result, {
          noInstructionsWhenCollapsed: false,
          overlayVisible: false,
          shortInstructions: undefined,
          shortInstructions2: undefined,
          longInstructions: undefined,
          dynamicInstructions: undefined,
          teacherMarkdown: undefined,
          hasContainedLevels: undefined,
          levelVideos: undefined,
          mapReference: '/test/abc.html',
          referenceLinks: undefined
        });
      });

      it('instructions outputs referenceLinks data when it is associated with the given level', () => {
        const result = determineInstructionsConstants({
          level: {
            referenceLinks: ['/test/alpha.html', '/test/beta.html']
          },
          skin: {},
          ENGLISH_LOCALE,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane,
          overlayVisible
        });

        assert.deepEqual(result, {
          noInstructionsWhenCollapsed: false,
          overlayVisible: false,
          shortInstructions: undefined,
          shortInstructions2: undefined,
          longInstructions: undefined,
          dynamicInstructions: undefined,
          teacherMarkdown: undefined,
          hasContainedLevels: undefined,
          levelVideos: undefined,
          mapReference: undefined,
          referenceLinks: ['/test/alpha.html', '/test/beta.html']
        });
      });
    });
  });
});
