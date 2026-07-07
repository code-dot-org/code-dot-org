import {test} from './fixtures/visual';
import {DemoPage} from './poms/DemoPage';

// One visual checkpoint per scenario, in light and dark. No baselines are
// committed — CI diffs against Applitools; `yarn test:visual:prove` checks
// these captures are deterministic locally. The scenario list mirrors
// demo/scenarios.tsx (kept here to keep e2e decoupled from the demo source).
const SCENARIOS = [
  {id: 'basic', name: 'Basic'},
  {id: 'sanitization', name: 'Sanitization'},
  {id: 'callout', name: 'Callout'},
  {id: 'inline-styles', name: 'Inline styles'},
  {id: 'embeds', name: 'Embeds'},
  {id: 'external-links', name: 'External links'},
  {id: 'details', name: 'Details'},
  {id: 'visual-code-blocks', name: 'Visual code blocks'},
  {id: 'vocabulary-definitions', name: 'Vocabulary definitions'},
  {id: 'clickable-text', name: 'Clickable text'},
  {id: 'expandable-images', name: 'Expandable images'},
  {id: 'localized', name: 'Localized (simulated)'},
] as const;

test.describe('@visual markdown scenarios', () => {
  for (const {id, name} of SCENARIOS) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${id} (${theme})`, async ({page, visualCheck}) => {
        const demo = await DemoPage.load(page);
        await demo.selectScenario(name);
        await demo.setDarkMode(theme === 'dark');
        await visualCheck(`markdown-${id}-${theme}`);
      });
    }
  }
});
