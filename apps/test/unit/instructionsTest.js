import {assert} from '../util/configuredChai';
var testUtils = require('./../util/testUtils');
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();

import instructions, {
  toggleInstructionsCollapsed,
  setInstructionsRenderedHeight,
  setInstructionsMaxHeightAvailable,
  setInstructionsMaxHeightNeeded,
  determineInstructionsConstants
} from '@cdo/apps/redux/instructions';

const ENGLISH_LOCALE = 'en_us';

describe('instructions reducer', () => {
  var reducer = instructions;

  it('starts out uncollapsed', () => {
    var state = reducer(undefined, {});
    assert.strictEqual(state.collapsed, false);
  });

  it('toggles collapsed', () => {
    var initialState, newState;

    // start collapsed
    initialState = {
      collapsed: false,
      longInstructions: 'foo'
    };
    newState = reducer(initialState, toggleInstructionsCollapsed());
    assert.strictEqual(newState.collapsed, true);

    // start uncollapsed
    initialState = {
      collapsed: true,
      longInstructions: 'foo'
    };
    newState = reducer(initialState, toggleInstructionsCollapsed());
    assert.strictEqual(newState.collapsed, false);
  });

  it('fails to collapse if no long instructions', () => {
    var initialState, newState;

    // start collapsed
    initialState = {
      collapsed: false,
      shortInstructions: 'short',
      longInstructions: undefined
    };
    assert.throws(() => {
      newState = reducer(initialState, toggleInstructionsCollapsed());
    });
  });

  it('setInstructionsRenderedHeight updates rendered and expanded height if not collapsed', () => {
    var initialState, newState;
    initialState = {
      collapsed: false,
      renderedHeight: 0,
      expandedHeight: 0
    };
    newState = reducer(initialState, setInstructionsRenderedHeight(200));
    assert.deepEqual(newState, {
      collapsed: false,
      renderedHeight: 200,
      expandedHeight: 200
    });
  });

  it('setInstructionsRenderedHeight updates only rendered height if collapsed', () => {
    var initialState, newState;
    initialState = {
      collapsed: true,
      renderedHeight: 0,
      expandedHeight: 0
    };
    newState = reducer(initialState, setInstructionsRenderedHeight(200));
    assert.deepEqual(newState, {
      collapsed: true,
      renderedHeight: 200,
      expandedHeight: 0
    });
  });


  it('setInstructionsMaxHeightNeeded sets maxNeededHeight', () => {
    var initialState, newState;
    initialState = {
      maxNeededHeight: 0
    };
    newState = reducer(initialState, setInstructionsMaxHeightNeeded(200));
    assert.deepEqual(newState, {
      maxNeededHeight: 200,
    });
  });

  it('setInstructionsMaxHeightAvailable updates maxAvailableHeight', () => {
    var initialState, newState;
    initialState = {
      maxAvailableHeight: Infinity,
      renderedHeight: 0,
      expandedHeight: 0
    };
    newState = reducer(initialState, setInstructionsMaxHeightAvailable(300));
    assert.deepEqual(newState, {
      maxAvailableHeight: 300,
      renderedHeight: 0,
      expandedHeight: 0
    });
  });

  it('setInstructionsMaxHeightAvailable adjusts rendered/expanded height if necessary', () => {
    var initialState, newState;
    initialState = {
      maxAvailableHeight: Infinity,
      renderedHeight: 400,
      expandedHeight: 400
    };
    newState = reducer(initialState, setInstructionsMaxHeightAvailable(300));
    assert.deepEqual(newState, {
      maxAvailableHeight: 300,
      renderedHeight: 300,
      expandedHeight: 300
    });
  });
});


describe('determineInstructionsConstants', () => {
  describe('CSP mode', () => {
    const noInstructionsWhenCollapsed = true;
    const showInstructionsInTopPane = true;
    const hasContainedLevels = false;

    it('sets longInstructions to markdownInstructions regardless of locale', () => {
      const locales = ['fr-fr', ENGLISH_LOCALE, undefined];
      const results = locales.map(locale => determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'markdown',
        },
        skin: {},
        locale,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane,
        hasContainedLevels
      }));

      results.forEach(result => {
        assert.equal(result.longInstructions, 'markdown');
      });
    });

    it('sets longInstructions to be non-markdown instructions if no markdownInstructions given', () => {
      const result = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: undefined,
        },
        skin: {},
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane,
        hasContainedLevels
      });

      assert.equal(result.longInstructions, 'non-markdown');
    });

    it('never sets shortInstructions', () => {
      // only given non-markdown
      const result = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: undefined,
        },
        skin: {},
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane,
        hasContainedLevels
      });

      assert.equal(result.shortInstructions, undefined);

      // only given markdown
      const result2 = determineInstructionsConstants({
        level: {
          instructions: undefined,
          markdownInstructions: 'markdown',
        },
        skin: {},
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane,
        hasContainedLevels
      });

      assert.equal(result2.shortInstructions, undefined);

      // given both
      const result3 = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'markdown',
        },
        skin: {},
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane,
        hasContainedLevels
      });

      assert.equal(result3.shortInstructions, undefined);
    });
  });

  describe('CSF mode', () => {
    const noInstructionsWhenCollapsed = false;
    const showInstructionsInTopPane = true;
    const hasContainedLevels = false;

    it('sets long and short instructions for english locale', () => {
      // en_us and undefined should both be treated as english
      ['en_us', undefined].forEach(locale => {
        const result = determineInstructionsConstants({
          level: {
            instructions: 'non-markdown',
            markdownInstructions: 'markdown',
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
          hasContainedLevels
        });
      });
    });

    it('does not set long instructions if non-english locale', () => {
      const result = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'markdown',
        },
        skin: {},
        locale: 'fr-fr',
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane,
        hasContainedLevels
      });
      assert.deepEqual(result, {
        noInstructionsWhenCollapsed,
        shortInstructions: 'non-markdown',
        shortInstructions2: undefined,
        longInstructions: undefined,
        hasContainedLevels
      });
    });

    it('does not set long instructions if identical to short-instructions, and ' +
        'showInstructionsInTopPane is true', () => {
      const result = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'non-markdown',
        },
        skin: {},
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane,
        hasContainedLevels
      });
      assert.deepEqual(result, {
        noInstructionsWhenCollapsed,
        shortInstructions: 'non-markdown',
        shortInstructions2: undefined,
        longInstructions: undefined,
        hasContainedLevels
      });
    });

    it('sets long instructions if we have an inputOutputTable', () => {
      const inputOutputTable =  [[15, 5], [20, 10]];
      const result = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: undefined,
          inputOutputTable
        },
        skin: {},
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane,
        hasContainedLevels
      });
      assert.equal(result.longInstructions, 'non-markdown');

      const result2 = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'markdown',
          inputOutputTable
        },
        skin: {},
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane,
        hasContainedLevels
      });
      assert.equal(result2.longInstructions, 'markdown');
    });

    it('substitutes images in instructions', () => {
      const result = determineInstructionsConstants({
        level: {
          instructions: 'Instructions with [image1]',
          instructions2: 'Instructions with [image2]',
          markdownInstructions: undefined
        },
        skin: {
          instructions2ImageSubstitutions: {
            image1: '/image1.png',
            image2: '/image2.png'
          }
        },
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
      });

      assert(/image1\.png/.test(result.shortInstructions), 'image 1 is replaced');
      assert(/image2\.png/.test(result.shortInstructions2), 'image 2 is replaced');
    });
  });
});
