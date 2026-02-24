import {generateAiTutorPrompt} from '@cdo/apps/weblab2/helpers/aiTutorPromptGenerator';
import basePrompt from '@cdo/apps/weblab2/prompts/basePrompt.md';
import askContract from '@cdo/apps/weblab2/prompts/modeContracts/ask.md';
import buildCSSContract from '@cdo/apps/weblab2/prompts/modeContracts/buildCSS.md';
import buildHTMLContract from '@cdo/apps/weblab2/prompts/modeContracts/buildHTML.md';
import askTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/ask.md';
import buildCSSTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/buildCSS.md';
import buildHTMLTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/buildHTML.md';
import preReplyCheck from '@cdo/apps/weblab2/prompts/preReplyCheck.md';
import {AiTutorMode} from '@cdo/apps/weblab2/types';

const ALL_MODES: AiTutorMode[] = [
  'buildHTML',
  'buildCSS',
  'buildJavaScript',
  'ask',
  'hint',
  'debug',
  'example',
  'testCase',
  'explainCode',
  'pseudocode',
  'documentation',
  'refusal',
  'refusalJavaScriptSnippets',
];

describe('generateAiTutorPrompt', () => {
  describe('fixed sections', () => {
    it('starts with basePrompt content', () => {
      const result = generateAiTutorPrompt(ALL_MODES);
      expect(result.startsWith(basePrompt.trim())).toBe(true);
    });

    it('ends with preReplyCheck content', () => {
      const result = generateAiTutorPrompt(ALL_MODES);
      expect(result.endsWith(preReplyCheck.trim())).toBe(true);
    });

    it('includes the Mode Router header', () => {
      const result = generateAiTutorPrompt(ALL_MODES);
      expect(result).toContain('## Mode Router (deterministic)');
      expect(result).toContain(
        'Choose exactly one mode per reply using these rules:'
      );
    });

    it('includes the Mode Answer Contracts header', () => {
      const result = generateAiTutorPrompt(ALL_MODES);
      expect(result).toContain('## Mode Answer Contracts');
    });

    it('places the Mode Router section before Mode Answer Contracts', () => {
      const result = generateAiTutorPrompt(ALL_MODES);
      expect(result.indexOf('## Mode Router')).toBeLessThan(
        result.indexOf('## Mode Answer Contracts')
      );
    });
  });

  describe('mode router group headings', () => {
    it('includes all three group headings when all modes are present', () => {
      const result = generateAiTutorPrompt(ALL_MODES);
      expect(result).toContain('### Build Modes (produce code now)');
      expect(result).toContain('### Tutoring Modes (no runnable JS)');
      expect(result).toContain('### Refusal Modes');
    });

    it('omits Build Modes heading when no build modes are included', () => {
      const result = generateAiTutorPrompt(['ask', 'hint', 'refusal']);
      expect(result).not.toContain('### Build Modes (produce code now)');
      expect(result).toContain('### Tutoring Modes (no runnable JS)');
      expect(result).toContain('### Refusal Modes');
    });

    it('omits Tutoring Modes heading when no tutoring modes are included', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'refusal']);
      expect(result).not.toContain('### Tutoring Modes (no runnable JS)');
      expect(result).toContain('### Build Modes (produce code now)');
      expect(result).toContain('### Refusal Modes');
    });

    it('omits Refusal Modes heading when no refusal modes are included', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'ask']);
      expect(result).not.toContain('### Refusal Modes');
      expect(result).toContain('### Build Modes (produce code now)');
      expect(result).toContain('### Tutoring Modes (no runnable JS)');
    });

    it('omits all group headings when modes list is empty', () => {
      const result = generateAiTutorPrompt([]);
      expect(result).not.toContain('### Build Modes (produce code now)');
      expect(result).not.toContain('### Tutoring Modes (no runnable JS)');
      expect(result).not.toContain('### Refusal Modes');
    });
  });

  describe('triggers', () => {
    it('includes trigger content for each requested mode', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'buildCSS', 'ask']);
      expect(result).toContain(buildHTMLTrigger.trim());
      expect(result).toContain(buildCSSTrigger.trim());
      expect(result).toContain(askTrigger.trim());
    });

    it('excludes trigger content for modes not in the list', () => {
      const result = generateAiTutorPrompt(['buildHTML']);
      expect(result).not.toContain(askTrigger.trim());
    });

    it('places triggers inside the Mode Router section', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'ask']);
      const routerStart = result.indexOf('## Mode Router');
      const contractsStart = result.indexOf('## Mode Answer Contracts');
      const htmlTriggerPos = result.indexOf(buildHTMLTrigger.trim());
      const askTriggerPos = result.indexOf(askTrigger.trim());
      expect(htmlTriggerPos).toBeGreaterThan(routerStart);
      expect(htmlTriggerPos).toBeLessThan(contractsStart);
      expect(askTriggerPos).toBeGreaterThan(routerStart);
      expect(askTriggerPos).toBeLessThan(contractsStart);
    });

    it('formats each trigger as a list item with a leading dash', () => {
      const result = generateAiTutorPrompt(['buildHTML']);
      expect(result).toContain(`- ${buildHTMLTrigger.trim()}`);
    });
  });

  describe('contracts', () => {
    it('includes contract content for each requested mode', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'buildCSS', 'ask']);
      expect(result).toContain(buildHTMLContract.trim());
      expect(result).toContain(buildCSSContract.trim());
      expect(result).toContain(askContract.trim());
    });

    it('excludes contract content for modes not in the list', () => {
      const result = generateAiTutorPrompt(['buildHTML']);
      expect(result).not.toContain(buildCSSContract.trim());
    });

    it('places contracts inside the Mode Answer Contracts section', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'buildCSS']);
      const contractsStart = result.indexOf('## Mode Answer Contracts');
      const preReplyStart = result.indexOf(preReplyCheck.trim());
      const htmlContractPos = result.indexOf(buildHTMLContract.trim());
      const cssContractPos = result.indexOf(buildCSSContract.trim());
      expect(htmlContractPos).toBeGreaterThan(contractsStart);
      expect(htmlContractPos).toBeLessThan(preReplyStart);
      expect(cssContractPos).toBeGreaterThan(contractsStart);
      expect(cssContractPos).toBeLessThan(preReplyStart);
    });
  });

  describe('empty modes list', () => {
    it('still produces a valid prompt with base sections', () => {
      const result = generateAiTutorPrompt([]);
      expect(result).toContain(basePrompt.trim());
      expect(result).toContain('## Mode Router (deterministic)');
      expect(result).toContain('## Mode Answer Contracts');
      expect(result).toContain(preReplyCheck.trim());
    });
  });
});
