import * as GoogleBlockly from 'blockly/core';

export interface InputConfig {
  label: string;
  mode: string;
  name: string;
  strict: boolean;
}

export interface CustomInputTypes {
  [key: string]: {
    addInput?: (
      blockly: GoogleBlocklyType,
      block: GoogleBlockly.Block,
      inputConfig: InputConfig,
      currentInputRow: GoogleBlockly.Input
    ) => void;
    generateCode?: (
      block: GoogleBlockly.Block,
      inputConfig: InputConfig
    ) => string;
    openEditor?: (event: UIEvent) => void;
  };
}

export declare function createJsWrapperBlockCreator(
  blockly: typeof GoogleBlockly,
  strictTypes: string[],
  defaultObjectType: string,
  customInputTypes: CustomInputTypes
);
