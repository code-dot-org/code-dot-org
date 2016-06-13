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

    it('sets longInstructions to markdownInstructions regardless of locale', () => {
      const locales = ['fr-fr', ENGLISH_LOCALE, undefined];
      const results = locales.map(locale => determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'markdown',
        },
        locale,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
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
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
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
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
      });

      assert.equal(result.shortInstructions, undefined);

      // only given markdown
      const result2 = determineInstructionsConstants({
        level: {
          instructions: undefined,
          markdownInstructions: 'markdown',
        },
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
      });

      assert.equal(result2.shortInstructions, undefined);

      // given both
      const result3 = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'markdown',
        },
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
      });

      assert.equal(result3.shortInstructions, undefined);
    });
  });

  describe('CSF mode', () => {
    const noInstructionsWhenCollapsed = false;
    const showInstructionsInTopPane = true;

    it('sets long and short instructions for english locale', () => {
      // en_us and undefined should both be treated as english
      ['en_us', undefined].forEach(locale => {
        const result = determineInstructionsConstants({
          level: {
            instructions: 'non-markdown',
            markdownInstructions: 'markdown',
          },
          locale,
          noInstructionsWhenCollapsed,
          showInstructionsInTopPane
        });
        assert.deepEqual(result, {
          noInstructionsWhenCollapsed,
          shortInstructions: 'non-markdown',
          longInstructions: 'markdown'
        });
      });
    });

    it('does not set long instructions if non-english locale', () => {
      const result = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'markdown',
        },
        locale: 'fr-fr',
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
      });
      assert.deepEqual(result, {
        noInstructionsWhenCollapsed,
        shortInstructions: 'non-markdown',
        longInstructions: undefined
      });
    });

    it('does not set long instructions if identical to short-instructions, and ' +
        'showInstructionsInTopPane is true', () => {
      const result = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'non-markdown',
        },
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
      });
      assert.deepEqual(result, {
        noInstructionsWhenCollapsed,
        shortInstructions: 'non-markdown',
        longInstructions: undefined
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
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
      });
      assert.equal(result.longInstructions, 'non-markdown');

      const result2 = determineInstructionsConstants({
        level: {
          instructions: 'non-markdown',
          markdownInstructions: 'markdown',
          inputOutputTable
        },
        ENGLISH_LOCALE,
        noInstructionsWhenCollapsed,
        showInstructionsInTopPane
      });
      assert.equal(result2.longInstructions, 'markdown');
    });
  });
});
