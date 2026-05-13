import type {BlockDefinition} from '@code-dot-org/blockly-workspace';
import {BaseBlocks} from '@code-dot-org/blockly-workspace';

/**
 * AI Trainer blocks. Three statements beyond `when_run`:
 *
 *   - `aitrainer_predict` — run the chosen algorithm on the test set and
 *     print accuracy + per-row predictions to the result panel.
 *   - `aitrainer_compare` — show side-by-side accuracies of two algorithms.
 *   - `aitrainer_clear` — clear the result panel between runs.
 *
 * Algorithm choices appear as dropdowns inside the blocks. There is no
 * separate `train` block: training data is the fixed `TRAINING_SET` and
 * each algorithm uses it internally (or ignores it, for the rule-based
 * ones).
 */

const algorithmDropdown = {
  type: 'field_dropdown',
  options: [
    ['majority class', 'majority'],
    ['nearest neighbor', 'nearest-neighbor'],
    ['rule: 3 eyes → foe', 'eyes-rule'],
    ['rule: large → foe', 'size-rule'],
  ],
};

const blocks: BlockDefinition[] = [
  BaseBlocks.when_run,
  {
    type: 'aitrainer_predict',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    tooltip:
      'Run a chosen classifier on the test set and print its accuracy.',
    message0: 'predict using %1',
    args0: [{...algorithmDropdown, name: 'ALGO'}],
    generator: {
      simple(block) {
        return `predict('${block.getFieldValue('ALGO')}');\n`;
      },
      javascript(block) {
        return `AiTrainer.predict('${block.getFieldValue('ALGO')}');\n`;
      },
    },
  },
  {
    type: 'aitrainer_compare',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    tooltip:
      'Run two classifiers and report which one performed better.',
    message0: 'compare %1 vs %2',
    args0: [
      {...algorithmDropdown, name: 'ALGO_A'},
      {...algorithmDropdown, name: 'ALGO_B'},
    ],
    generator: {
      simple(block) {
        const a = block.getFieldValue('ALGO_A');
        const b = block.getFieldValue('ALGO_B');
        return `compare('${a}', '${b}');\n`;
      },
      javascript(block) {
        const a = block.getFieldValue('ALGO_A');
        const b = block.getFieldValue('ALGO_B');
        return `AiTrainer.compare('${a}', '${b}');\n`;
      },
    },
  },
  {
    type: 'aitrainer_clear',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    tooltip: 'Clear past results before running again.',
    message0: 'clear results',
    generator: {
      simple() {
        return 'clear();\n';
      },
      javascript() {
        return 'AiTrainer.clear();\n';
      },
    },
  },
];

export default blocks;
