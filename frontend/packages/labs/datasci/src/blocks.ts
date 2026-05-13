import type {BlockDefinition} from '@code-dot-org/blockly-workspace';
import {BaseBlocks} from '@code-dot-org/blockly-workspace';

/**
 * Data Science 101 blocks. Five blocks beyond `when_run`:
 *  - `datasci_count` — counts the current rows
 *  - `datasci_average` — averages a numeric column (score)
 *  - `datasci_filter_grade` — narrows the working set to one grade
 *  - `datasci_reset` — drops the filter, back to all rows
 *  - `datasci_show` — prints arbitrary text to the result panel
 *
 * Generators emit `simple`-flavored function calls that the interpreter in
 * `DatasciLab` evaluates against a small fixed dataset. No JavaScript-flavored
 * generator is needed for the prototype.
 */
const blocks: BlockDefinition[] = [
  BaseBlocks.when_run,
  {
    type: 'datasci_count',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    tooltip: 'Counts the rows in the working dataset and prints the total.',
    message0: 'count rows',
    generator: {
      simple() {
        return 'count();\n';
      },
      javascript() {
        return 'Datasci.count();\n';
      },
    },
  },
  {
    type: 'datasci_average',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    tooltip: 'Averages a numeric column of the working dataset.',
    message0: 'average of %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'COLUMN',
        options: [
          ['score', 'score'],
          ['grade', 'grade'],
        ],
      },
    ],
    generator: {
      simple(block) {
        return `average('${block.getFieldValue('COLUMN')}');\n`;
      },
      javascript(block) {
        return `Datasci.average('${block.getFieldValue('COLUMN')}');\n`;
      },
    },
  },
  {
    type: 'datasci_filter_grade',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    tooltip:
      'Restricts the working dataset to one grade. ' +
      'Subsequent count/average blocks see only those rows.',
    message0: 'keep only grade %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'GRADE',
        options: [
          ['3', '3'],
          ['4', '4'],
          ['5', '5'],
        ],
      },
    ],
    generator: {
      simple(block) {
        return `filterGrade(${block.getFieldValue('GRADE')});\n`;
      },
      javascript(block) {
        return `Datasci.filterGrade(${block.getFieldValue('GRADE')});\n`;
      },
    },
  },
  {
    type: 'datasci_reset',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    tooltip: 'Drops any active filter — back to all rows.',
    message0: 'reset filter',
    generator: {
      simple() {
        return 'reset();\n';
      },
      javascript() {
        return 'Datasci.reset();\n';
      },
    },
  },
];

export default blocks;
