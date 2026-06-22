import {
  ALL_PYTHONLAB_ANSWER_TYPES,
  generateAiTutorPrompt,
} from '@cdo/apps/pythonlab/helpers/aiTutorPromptGenerator';
import askContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/ask.md';
import buildPythonContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/buildPython.md';
import refusalContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/refusal.md';
import refusalPythonSnippetsContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/refusalPythonSnippets.md';
import askTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/ask.md';
import buildPythonTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/buildPython.md';
import basePrompt from '@cdo/apps/pythonlab/prompts/basePrompt.md';
import environmentPrompt from '@cdo/apps/pythonlab/prompts/environment.md';

describe('generateAiTutorPrompt', () => {
  describe('fixed sections', () => {
    it('starts with environmentPrompt content', () => {
      const result = generateAiTutorPrompt(ALL_PYTHONLAB_ANSWER_TYPES);
      expect(result.startsWith(environmentPrompt.trim())).toBe(true);
    });

    it('includes basePrompt content', () => {
      const result = generateAiTutorPrompt(ALL_PYTHONLAB_ANSWER_TYPES);
      expect(result).toContain(basePrompt.trim());
    });

    it('places environmentPrompt before basePrompt', () => {
      const result = generateAiTutorPrompt(ALL_PYTHONLAB_ANSWER_TYPES);
      expect(result.indexOf(environmentPrompt.trim())).toBeLessThan(
        result.indexOf(basePrompt.trim())
      );
    });

    it('includes the Mode Router header', () => {
      const result = generateAiTutorPrompt(ALL_PYTHONLAB_ANSWER_TYPES);
      expect(result).toContain('## Mode Router (deterministic)');
      expect(result).toContain(
        'Choose exactly one mode per reply using these rules:'
      );
    });

    it('includes the Mode Answer Contracts header', () => {
      const result = generateAiTutorPrompt(ALL_PYTHONLAB_ANSWER_TYPES);
      expect(result).toContain('## Mode Answer Contracts');
    });

    it('places the Mode Router section before Mode Answer Contracts', () => {
      const result = generateAiTutorPrompt(ALL_PYTHONLAB_ANSWER_TYPES);
      expect(result.indexOf('## Mode Router')).toBeLessThan(
        result.indexOf('## Mode Answer Contracts')
      );
    });
  });

  describe('mode router group headings', () => {
    it('includes all three group headings when all answer types are present', () => {
      const result = generateAiTutorPrompt(ALL_PYTHONLAB_ANSWER_TYPES);
      expect(result).toContain('### Build Modes (produce code now)');
      expect(result).toContain('### Tutoring Modes (no runnable Python)');
      expect(result).toContain('### Refusal Modes');
    });

    it('omits Build Modes heading when no build answer types are included', () => {
      const result = generateAiTutorPrompt(['ask', 'hint']);
      expect(result).not.toContain('### Build Modes (produce code now)');
    });

    it('omits Tutoring Modes heading when no tutoring answer types are included', () => {
      const result = generateAiTutorPrompt(['buildPython']);
      expect(result).not.toContain('### Tutoring Modes (no runnable Python)');
    });

    it('always includes Refusal Modes heading', () => {
      const result = generateAiTutorPrompt(['buildPython', 'ask']);
      expect(result).toContain('### Refusal Modes');
    });
  });

  describe('refusal mode selection', () => {
    it('includes only refusal when buildPython is in the list', () => {
      const result = generateAiTutorPrompt(['buildPython', 'ask']);
      expect(result).toContain(refusalContract.trim());
      expect(result).not.toContain(refusalPythonSnippetsContract.trim());
    });

    it('includes both refusal and refusalPythonSnippets when buildPython is not in the list', () => {
      const result = generateAiTutorPrompt(['ask', 'hint']);
      expect(result).toContain(refusalContract.trim());
      expect(result).toContain(refusalPythonSnippetsContract.trim());
    });

    it('strips explicit refusal types from input before deriving them', () => {
      const result = generateAiTutorPrompt([
        'buildPython',
        'refusalPythonSnippets',
      ]);
      expect(result).not.toContain(refusalPythonSnippetsContract.trim());
    });
  });

  describe('triggers', () => {
    it('includes trigger content for each requested answer type', () => {
      const result = generateAiTutorPrompt(['buildPython', 'ask']);
      expect(result).toContain(buildPythonTrigger.trim());
      expect(result).toContain(askTrigger.trim());
    });

    it('excludes trigger content for answer types not in the list', () => {
      const result = generateAiTutorPrompt(['buildPython']);
      expect(result).not.toContain(askTrigger.trim());
    });

    it('places triggers inside the Mode Router section', () => {
      const result = generateAiTutorPrompt(['buildPython', 'ask']);
      const routerStart = result.indexOf('## Mode Router');
      const contractsStart = result.indexOf('## Mode Answer Contracts');
      expect(result.indexOf(buildPythonTrigger.trim())).toBeGreaterThan(
        routerStart
      );
      expect(result.indexOf(buildPythonTrigger.trim())).toBeLessThan(
        contractsStart
      );
      expect(result.indexOf(askTrigger.trim())).toBeGreaterThan(routerStart);
      expect(result.indexOf(askTrigger.trim())).toBeLessThan(contractsStart);
    });

    it('formats each trigger as a list item with a leading dash', () => {
      const result = generateAiTutorPrompt(['buildPython']);
      expect(result).toContain(`- ${buildPythonTrigger.trim()}`);
    });
  });

  describe('contracts', () => {
    it('includes contract content for each requested answer type', () => {
      const result = generateAiTutorPrompt(['buildPython', 'ask']);
      expect(result).toContain(buildPythonContract.trim());
      expect(result).toContain(askContract.trim());
    });

    it('excludes contract content for answer types not in the list', () => {
      const result = generateAiTutorPrompt(['buildPython']);
      expect(result).not.toContain(askContract.trim());
    });

    it('places contracts after the Mode Answer Contracts header', () => {
      const result = generateAiTutorPrompt(['buildPython', 'ask']);
      const contractsStart = result.indexOf('## Mode Answer Contracts');
      expect(result.indexOf(buildPythonContract.trim())).toBeGreaterThan(
        contractsStart
      );
      expect(result.indexOf(askContract.trim())).toBeGreaterThan(
        contractsStart
      );
    });
  });

  describe('answerTypeCustomizations', () => {
    it('appends customization text after the base contract', () => {
      const result = generateAiTutorPrompt(['ask'], {
        ask: 'Extra instruction.',
      });
      const contractPos = result.indexOf(askContract.trim());
      const customPos = result.indexOf('Extra instruction.');
      expect(customPos).toBeGreaterThan(contractPos);
    });

    it('does not add extra text when no customization is provided', () => {
      const withCustom = generateAiTutorPrompt(['ask'], {ask: 'Extra.'});
      const withoutCustom = generateAiTutorPrompt(['ask']);
      expect(withoutCustom).not.toContain('Extra.');
      expect(withCustom.length).toBeGreaterThan(withoutCustom.length);
    });
  });

  describe('empty answer types list', () => {
    it('falls back to DEFAULT_ANSWER_TYPES when the list is empty', () => {
      const fromEmpty = generateAiTutorPrompt([]);
      const fromDefaults = generateAiTutorPrompt(ALL_PYTHONLAB_ANSWER_TYPES);
      expect(fromEmpty).toBe(fromDefaults);
    });
  });
});
