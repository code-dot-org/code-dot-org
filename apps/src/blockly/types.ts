import {
  Block,
  BlockSvg,
  BlocklyOptions,
  Input,
  Theme,
  VariableMap,
  Workspace,
  WorkspaceSvg,
} from 'blockly';
import GoogleBlockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import {
  BLOCK_TYPES,
  BlocklyVersion,
  Themes,
  WORKSPACE_EVENTS,
} from './constants';
import {Field, FieldProto} from 'blockly/core/field';
import CdoFieldButton from './addons/cdoFieldButton';
import {CdoFieldImageDropdown} from './addons/cdoFieldImageDropdown';
import CdoFieldToggle from './addons/cdoFieldToggle';
import CdoFieldFlyout from './addons/cdoFieldFlyout';
import {ProcedureSerializer} from 'blockly/core/serialization/procedures';
import {
  ObservableParameterModel,
  ObservableProcedureModel,
} from '@blockly/block-shareable-procedures';
import {Abstract} from 'blockly/core/events/events_abstract';
import {ToolboxDefinition} from 'blockly/core/utils/toolbox';
import FunctionEditor from './addons/functionEditor';
import WorkspaceSvgFrame from './addons/workspaceSvgFrame';
import {IProcedureBlock} from 'blockly/core/procedures';

export interface BlockDefinition {
  category: string;
  config: BlockConfig;
  helperCode: string;
  name: string;
  pool: string;
}

export interface BlockConfig {
  args: arg[];
  blockText: string;
  color: [number, number, number];
  func: string;
  style: string;
}

export interface arg {
  customInput: string;
  name: string;
}

type GoogleBlocklyType = typeof GoogleBlockly;

// Type for the Blockly instance created and modified by googleBlocklyWrapper.
export interface BlocklyWrapperType extends GoogleBlocklyType {
  version: BlocklyVersion;
  blockly_: typeof GoogleBlockly;
  mainWorkspace: GoogleBlockly.WorkspaceSvg | undefined;
  embeddedWorkspaces: string[];
  procedureSerializer: ProcedureSerializer<
    ObservableProcedureModel,
    ObservableParameterModel
  >;
  themes: {[key in Themes]: Theme};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigationController: any; // Navigation Controller is not typed by Blockly
  BlockSpace: {
    EVENTS: typeof WORKSPACE_EVENTS;
    onMainBlockSpaceCreated: (callback: () => void) => void;
  };

  FieldButton: typeof CdoFieldButton;
  FieldImageDropdown: typeof CdoFieldImageDropdown;
  FieldToggle: typeof CdoFieldToggle;
  FieldFlyout: typeof CdoFieldFlyout;
  JavaScript: typeof javascriptGenerator;
  assetUrl: (path: string) => string;
  customSimpleDialog: (config: object) => void;
  levelBlockIds: string[];
  isStartMode: boolean;
  isToolboxMode: boolean;
  toolboxBlocks: Element | ToolboxDefinition | undefined;
  useModalFunctionEditor: boolean;
  functionEditor: FunctionEditor;
  mainBlockSpace: ExtendedWorkspaceSvg;
  hiddenDefinitionWorkspace: ExtendedWorkspace;
  // TODO: better define this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customBlocks: any;
  // TODO: better define this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cdoUtils: any;

  wrapReadOnlyProperty: (propertyName: string) => void;
  wrapSettableProperty: (propertyName: string) => void;
  overrideFields: (overrides: [string, string, FieldProto][]) => void;
  setInfiniteLoopTrap: () => void;
  clearInfiniteLoopTrap: () => void;
  getInfiniteLoopTrap: () => string;
  loopHighlight: () => void;
  getWorkspaceCode: () => string;
  addChangeListener: (
    blockspace: Workspace,
    handler: (e: Abstract) => void
  ) => void;
  getGenerator: () => typeof javascriptGenerator;
  addEmbeddedWorkspace: (workspace: WorkspaceSvg) => void;
  isEmbeddedWorkspace: (workspace: WorkspaceSvg) => boolean;
  findEmptyContainerBlock: () => void;
  createEmbeddedWorkspace: (
    container: HTMLElement,
    xml: Node,
    options: BlocklyOptions
  ) => WorkspaceSvg;
  setMainWorkspace: (workspace: WorkspaceSvg) => void;
  getMainWorkspace: () => ExtendedWorkspaceSvg;
  setHiddenDefinitionWorkspace: (workspace: ExtendedWorkspace) => void;
  getHiddenDefinitionWorkspace: () => ExtendedWorkspace;
  fireUiEvent: (element: Element, eventName: string) => void;
  getFunctionEditorWorkspace: () => ExtendedWorkspaceSvg | undefined;
  clearAllStudentWorkspaces: () => void;
  getPointerBlockImageUrl: (
    block: Block,
    pointerMetadataMap: {
      [blockType: string]: {imageSourceType: string; imageIndex: number};
    },
    imageSourceId: string
  ) => string;
}

export type GoogleBlocklyInstance = typeof GoogleBlockly;

// Extended types are Blockly types we have monkey patched in googleBlocklyWrapper.
// We have specific methods we rely on from CDO Blockly that we needed to continue to support,
// but Blockly does not support overriding their base classes. Therefore we create these Extended
// types and can cast to them when needed.

export interface ExtendedBlockSvg extends BlockSvg {
  isDisabled: () => boolean;
  getHexColour: () => string;
  isVisible: () => boolean;
  isUserVisible: () => boolean;
}

export interface ExtendedInput extends Input {
  setStrictCheck: (check: string | string[] | null) => Input;
  // Blockly explicitly uses any for this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFieldRow: () => Field<any>[];
}

export interface ExtendedBlock extends Block {
  setStrictOutput: (isOutput: boolean, check: string | string[] | null) => void;
  // Blockly uses any for value.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTitleValue: (newValue: any, name: string) => void;
}

export interface ExtendedWorkspaceSvg extends WorkspaceSvg {
  globalVariables: string[];
  noFunctionBlockFrame: boolean;
  events: {
    dispatchEvent: () => void;
  };
  addUnusedBlocksHelpListener: () => void;
  getAllUsedBlocks: () => Block[];
  registerGlobalVariables: (variableList: string[]) => void;
  getVariableMap: () => ExtendedVariableMap;
  getContainer: () => ParentNode | null;
  setEnableToolbox: () => void;
  traceOn: () => void;
}

export interface EditorWorkspaceSvg extends ExtendedWorkspaceSvg {
  svgFrame_: WorkspaceSvgFrame;
}

export interface ExtendedVariableMap extends VariableMap {
  addVariables: (variableList: string[]) => void;
}

export interface ExtendedBlocklyOptions extends BlocklyOptions {
  assetUrl: (path: string) => string;
  customSimpleDialog: (config: object) => void;
  levelBlockIds: string[];
  isBlockEditMode: boolean;
  editBlocks: string | undefined;
  noFunctionBlockFrame: boolean;
  useModalFunctionEditor: boolean;
}

export interface ExtendedWorkspace extends Workspace {
  noFunctionBlockFrame: boolean;
}

export interface ProcedureBlock extends Block, IProcedureBlock {
  userCreated: boolean;
}

export interface ProcedureBlockConfiguration {
  kind: 'block';
  type: ProcedureType;
  extraState: {
    procedureId: string;
    userCreated: boolean;
    behaviorId?: string;
  };
  fields: {
    NAME: string;
  };
}

export type ProcedureType =
  | BLOCK_TYPES.procedureDefinition
  | BLOCK_TYPES.behaviorDefinition;
