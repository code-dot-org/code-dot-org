import {generateAiTutorPrompt} from '@cdo/apps/weblab2/helpers/aiTutorPromptGenerator';
import askContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/ask.md';
import buildCSSContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildCSS.md';
import buildHTMLContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildHTML.md';
import askTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/ask.md';
import buildCSSTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/buildCSS.md';
import buildHTMLTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/buildHTML.md';
import basePrompt from '@cdo/apps/weblab2/prompts/basePrompt.md';
import preReplyCheckAllowJs from '@cdo/apps/weblab2/prompts/preReplyCheckAllowJs.md';
import preReplyCheckNoJs from '@cdo/apps/weblab2/prompts/preReplyCheckNoJs.md';
import {AiTutorAnswerType} from '@cdo/apps/weblab2/types';

const ALL_ANSWER_TYPES: AiTutorAnswerType[] = [
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
];

describe('generateAiTutorPrompt', () => {
  describe('fixed sections', () => {
    it('starts with basePrompt content', () => {
      const result = generateAiTutorPrompt(ALL_ANSWER_TYPES);
      expect(result.startsWith(basePrompt.trim())).toBe(true);
    });

    it('ends with preReplyCheckAllowJs content if buildJavaScript answer type is included', () => {
      const result = generateAiTutorPrompt(ALL_ANSWER_TYPES);
      expect(result.endsWith(preReplyCheckAllowJs.trim())).toBe(true);
    });

    it('ends with preReplyCheckNoJs content if buildJavaScript answer type is not included', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'buildCSS', 'ask']);
      expect(result.endsWith(preReplyCheckNoJs.trim())).toBe(true);
    });

    it('includes the Mode Router header', () => {
      const result = generateAiTutorPrompt(ALL_ANSWER_TYPES);
      expect(result).toContain('## Mode Router (deterministic)');
      expect(result).toContain(
        'Choose exactly one mode per reply using these rules:'
      );
    });

    it('includes the Mode Answer Contracts header', () => {
      const result = generateAiTutorPrompt(ALL_ANSWER_TYPES);
      expect(result).toContain('## Mode Answer Contracts');
    });

    it('places the Mode Router section before Mode Answer Contracts', () => {
      const result = generateAiTutorPrompt(ALL_ANSWER_TYPES);
      expect(result.indexOf('## Mode Router')).toBeLessThan(
        result.indexOf('## Mode Answer Contracts')
      );
    });
  });

  describe('mode router group headings', () => {
    it('includes all three group headings when all answer types are present', () => {
      const result = generateAiTutorPrompt(ALL_ANSWER_TYPES);
      expect(result).toContain('### Build Modes (produce code now)');
      expect(result).toContain('### Tutoring Modes (no runnable JS)');
      expect(result).toContain('### Refusal Modes');
    });

    it('omits Build Modes heading when no build answer types are included', () => {
      const result = generateAiTutorPrompt(['ask', 'hint']);
      expect(result).not.toContain('### Build Modes (produce code now)');
    });

    it('omits Tutoring Modes heading when no tutoring answer types are included', () => {
      const result = generateAiTutorPrompt(['buildHTML']);
      expect(result).not.toContain('### Tutoring Modes (no runnable JS)');
    });

    it('always includes Refusal Modes heading', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'ask']);
      expect(result).toContain('### Refusal Modes');
    });
  });

  describe('triggers', () => {
    it('includes trigger content for each requested answer type', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'buildCSS', 'ask']);
      expect(result).toContain(buildHTMLTrigger.trim());
      expect(result).toContain(buildCSSTrigger.trim());
      expect(result).toContain(askTrigger.trim());
    });

    it('excludes trigger content for answer types not in the list', () => {
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
    it('includes contract content for each requested answer type', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'buildCSS', 'ask']);
      expect(result).toContain(buildHTMLContract.trim());
      expect(result).toContain(buildCSSContract.trim());
      expect(result).toContain(askContract.trim());
    });

    it('excludes contract content for answer types not in the list', () => {
      const result = generateAiTutorPrompt(['buildHTML']);
      expect(result).not.toContain(buildCSSContract.trim());
    });

    it('places contracts inside the Mode Answer Contracts section', () => {
      const result = generateAiTutorPrompt(['buildHTML', 'buildCSS']);
      const contractsStart = result.indexOf('## Mode Answer Contracts');
      const preReplyStart = result.indexOf(preReplyCheckNoJs.trim());
      const htmlContractPos = result.indexOf(buildHTMLContract.trim());
      const cssContractPos = result.indexOf(buildCSSContract.trim());
      expect(htmlContractPos).toBeGreaterThan(contractsStart);
      expect(htmlContractPos).toBeLessThan(preReplyStart);
      expect(cssContractPos).toBeGreaterThan(contractsStart);
      expect(cssContractPos).toBeLessThan(preReplyStart);
    });
  });

  describe('empty answer types list', () => {
    it('falls back to default answer types when answer types list is empty', () => {
      const result = generateAiTutorPrompt([]);
      expect(result).toContain(basePrompt.trim());
      expect(result).toContain(buildHTMLTrigger.trim());
      expect(result).toContain(buildCSSContract.trim());
      // Engineer allows javascript
      expect(result).toContain(preReplyCheckAllowJs.trim());
    });
  });
});
