// A level's block pool as @code-dot-org/blockly block definitions: apps'
// createJsWrapperBlockCreator and installCustomBlocks. Each block builds
// itself in init as block_utils' did, so pool blocks look and compile as
// they did in apps. Not carried: the mini-toolbox and the sprite pointer
// blocks' pictures.
import type * as BlocklyCore from 'blockly/core';
import {
  javascriptGenerator,
  type JavascriptGenerator,
  Order,
} from 'blockly/javascript';

import type {BlockDefinitions} from '@code-dot-org/blockly';

import {BlockStyles} from '../constants';

import {determineInputs, groupInputsByRow} from './inputs';
import {
  BlockValueType,
  checkFor,
  SPRITE_LAB_INPUT_TYPES,
  STANDARD_INPUT_TYPES,
} from './inputTypes';
import type {
  InputType,
  LabeledInput,
  PoolArg,
  PoolBlock,
  PoolBlockConfig,
} from './types';

// Types a socket or output checks strictly (apps' strictTypes).
const STRICT_TYPES = [
  BlockValueType.SPRITE,
  BlockValueType.BEHAVIOR,
  BlockValueType.LOCATION,
];

const STYLES: readonly string[] = [
  ...Object.values(BlockStyles),
  'world_blocks',
  'location_blocks',
];

const INPUT_TYPES: Record<string, InputType> = {
  ...STANDARD_INPUT_TYPES,
  ...SPRITE_LAB_INPUT_TYPES,
};

type EventBlock = BlocklyCore.Block & {skipNextBlockGeneration?: boolean};

let eventBlocksInstalled = false;

/**
 * An event block compiles the blocks below it into its handler, so the
 * generator must not append them again: apps' cdoGenerator did the same.
 */
function installEventBlockGeneration(): void {
  if (eventBlocksInstalled) {
    return;
  }
  eventBlocksInstalled = true;
  const blockToCode = javascriptGenerator.blockToCode;
  javascriptGenerator.blockToCode = function (
    this: JavascriptGenerator,
    block: BlocklyCore.Block | null,
    thisOnly?: boolean,
  ) {
    return blockToCode.call(
      this,
      block,
      !!(block as EventBlock | null)?.skipNextBlockGeneration || thisOnly,
    );
  } as typeof blockToCode;
}

export interface ConvertedPool {
  definitions: BlockDefinitions;
  /** Block types by the category the pool files them under. */
  blocksByCategory: Record<string, string[]>;
  /** Blocks that could not be converted, and why. */
  errors: {name: string; error: Error}[];
}

/** A pool block's type: its pool, or `gamelab` for the classic pool, then its name. */
export function poolBlockType(block: PoolBlock): string {
  const pool =
    !block.pool || block.pool === 'GamelabJr' ? 'gamelab' : block.pool;
  return `${pool}_${block.config.name || block.config.func}`;
}

function getHelpUrl(docFunc?: string): string {
  // Documentation is only available for Sprite Lab.
  return docFunc ? `/docs/spritelab/${docFunc}` : '';
}

function validate(config: PoolBlockConfig, helperCode?: string | null): void {
  const {func, expression, simpleValue, name, blockText, returnType} = config;
  const args = config.args ?? [];
  if (Number(!!func) + Number(!!expression) + Number(!!simpleValue) !== 1) {
    throw new Error('Provide exactly one of func, expression, or simpleValue');
  }
  if (
    func &&
    helperCode &&
    !new RegExp(`function ${func}\\W`).test(helperCode)
  ) {
    throw new Error(`func '${func}' not found in helper code`);
  }
  if ((expression || simpleValue) && !name) {
    throw new Error('This block requires a name');
  }
  if (blockText === undefined) {
    throw new Error('blockText must be specified');
  }
  if (simpleValue && args.filter(arg => !arg.assignment).length !== 1) {
    throw new Error(
      'simpleValue blocks must have exactly one non-assignment argument',
    );
  }
  if (simpleValue && !returnType && !args.some(arg => arg.assignment)) {
    throw new Error(
      'simpleValue blocks must specify a return type or have an assignment input',
    );
  }
  if (config.style && !STYLES.includes(config.style)) {
    throw new Error(`"${config.style}" is not a valid style`);
  }
  for (const arg of args) {
    if (arg.customInput && INPUT_TYPES[arg.customInput] === undefined) {
      throw new Error(`${arg.customInput} is not a valid input type`);
    }
  }
}

/** One pool block as a block definition. Throws on a malformed config. */
export function convertPoolBlock(block: PoolBlock) {
  const config = block.config;
  validate(config, block.helperCode);
  const {
    style,
    func,
    expression,
    orderPrecedence,
    blockText,
    returnType,
    methodCall,
    objectType,
    thisObject,
    eventBlock,
    eventLoopBlock,
    simpleValue,
    extraArgs,
    callbackParams,
    docFunc,
  } = config;
  const type = poolBlockType(block);
  let inline = config.inline ?? true;
  let args: PoolArg[] = [...(config.args ?? [])];
  if (args.filter(arg => arg.statement).length > 1 && inline) {
    inline = false;
  }
  // An event loop block that names no statement input gets one at the end.
  if (eventLoopBlock && !args.some(arg => arg.statement)) {
    args = [...args, {name: 'DO', statement: true}];
  }
  const inputs: PoolArg[] = [...args];
  if (methodCall && !thisObject) {
    const thisType = objectType || BlockValueType.SPRITE;
    inputs.push({
      name: 'THIS',
      type: thisType,
      strict: STRICT_TYPES.includes(thisType as never),
    });
  }
  const inputConfigs = determineInputs(blockText, inputs, STRICT_TYPES);
  const inputRows = groupInputsByRow(inputConfigs, INPUT_TYPES);
  if (inputRows.length === 1) {
    inline = false;
  }

  function init(this: BlocklyCore.Block) {
    this.setStyle(style || BlockStyles.DEFAULT);
    this.setHelpUrl(getHelpUrl(docFunc));
    if (returnType) {
      this.setOutput(true, checkFor(returnType));
    } else if (eventLoopBlock) {
      // No previous or next statement connector.
    } else if (eventBlock) {
      this.setNextStatement(true);
      (this as EventBlock).skipNextBlockGeneration = true;
    } else {
      this.setNextStatement(true);
      this.setPreviousStatement(true);
    }
    interpolateInputs(this, inputRows);
    this.setInputsInline(inline);
  }

  function generate(
    blockToCompile: BlocklyCore.Block,
    generator: JavascriptGenerator,
  ): string | [string, number] {
    let prefix = '';
    const values = args
      .map(arg => {
        const input = inputConfigs.find(input => input.name === arg.name);
        if (!input) {
          return undefined;
        }
        let code = INPUT_TYPES[input.mode].generateCode(
          blockToCompile,
          input,
          generator,
        );
        if (input.assignment) {
          prefix += `${code} = `;
        }
        // A missing input is passed as undefined.
        if (code === '') {
          code = 'undefined';
        }
        if (input.defer) {
          code = `function () {\n  return ${code};\n}`;
        }
        return code;
      })
      .filter(value => value !== null) as (string | string[] | undefined)[];

    if (extraArgs) {
      values.push(...extraArgs);
    }

    if (simpleValue) {
      const code = prefix + values[args.findIndex(arg => !arg.assignment)];
      return returnType !== undefined
        ? [code, orderPrecedence ?? Order.NONE]
        : code + ';\n';
    }

    if (methodCall) {
      const object =
        thisObject ||
        generator.valueToCode(blockToCompile, 'THIS', Order.MEMBER);
      prefix += `${object}.`;
    }

    if (eventBlock) {
      const next = blockToCompile.nextConnection?.targetBlock() ?? null;
      const handler = generator.prefixLines(
        generator.blockToCode(next, false) as string,
        '  ',
      );
      const params = callbackParams ? callbackParams.join(',') : '';
      values.push(`function (${params}) {\n${handler}}`);
    }

    // A prompt block sets its variable through a callback.
    if (
      type === 'gamelab_setPrompt' ||
      type === 'gamelab_setPromptWithChoices'
    ) {
      const target = blockToCompile.getInput('VAR')?.connection?.targetBlock();
      if (target?.type === 'variables_get') {
        const [varName] = generator.blockToCode(target) as [string, number];
        values.push(`function(val) {${varName} = val;}`);
      }
    }

    if (expression) {
      const valueExpression = expression.replace('VALUE', String(values[0]));
      return returnType !== undefined
        ? [`${prefix}${valueExpression}`, orderPrecedence ?? Order.NONE]
        : `${prefix}${valueExpression}`;
    }

    const call = `${prefix}${func}(${values.join(', ')})`;
    return returnType !== undefined
      ? [call, Order.FUNCTION_CALL]
      : `${call};\n`;
  }

  return {
    type,
    init,
    generator: {
      javascript: (b: BlocklyCore.BlockSvg, g: JavascriptGenerator) =>
        generate(b, g),
    },
  };
}

function interpolateInputs(
  block: BlocklyCore.Block,
  rows: LabeledInput[][],
): void {
  for (const row of rows) {
    // The row's last input first, then the fields before it onto that.
    const lastConfig = row[row.length - 1];
    const addInputRow = INPUT_TYPES[lastConfig.mode].addInputRow;
    if (!addInputRow) {
      throw new Error(`${lastConfig.mode} cannot end a row`);
    }
    const last = addInputRow(null, block, lastConfig);
    for (const config of row.slice(0, -1)) {
      INPUT_TYPES[config.mode].addInput?.(null, block, config, last);
    }
    last.appendField(lastConfig.label ?? '');
  }
}

/**
 * A level's `sharedBlocks` as block definitions. A block that fails to
 * convert is left out and reported.
 */
export function convertPool(
  pool: readonly PoolBlock[] | undefined,
): ConvertedPool {
  const definitions: BlockDefinitions = [];
  const blocksByCategory: Record<string, string[]> = {};
  const errors: ConvertedPool['errors'] = [];
  installEventBlockGeneration();
  for (const block of pool ?? []) {
    if (!block?.config) {
      continue;
    }
    try {
      const {type, init, generator} = convertPoolBlock(block);
      definitions.push({type, init, generator});
      const category = block.category ?? '';
      (blocksByCategory[category] ??= []).push(type);
      if (block.name && block.name !== type) {
        console.error(
          `Block config ${block.name} generated a block named ${type}`,
        );
      }
    } catch (error) {
      errors.push({
        name: block.name ?? block.config.func ?? '?',
        error: error as Error,
      });
    }
  }
  return {definitions, blocksByCategory, errors};
}
