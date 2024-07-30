import {
  ObservableParameterModel,
  ObservableProcedureModel,
} from '@blockly/block-shareable-procedures';
import {
  Block,
  BlockSvg,
  BlocklyOptions,
  CodeGenerator,
  Cursor,
  Input,
  Procedures,
  Theme,
  Variables,
  VariableMap,
  Workspace,
  WorkspaceSvg,
  Xml,
} from 'blockly';
import GoogleBlockly, {Connection, Names} from 'blockly/core';
import {Abstract} from 'blockly/core/events/events_abstract';
import {Field, FieldProto} from 'blockly/core/field';
import {IProcedureBlock, IProcedureModel} from 'blockly/core/procedures';
import {ProcedureSerializer} from 'blockly/core/serialization/procedures';
import {ToolboxDefinition} from 'blockly/core/utils/toolbox';
import {javascriptGenerator} from 'blockly/javascript';

import BlockSvgFrame from './addons/blockSvgFrame';
import BlockSvgLimitIndicator from './addons/blockSvgLimitIndicator';
import CdoAngleHelper from './addons/cdoAngleHelper';
import CdoFieldAngleDropdown from './addons/cdoFieldAngleDropdown';
import CdoFieldAngleTextInput from './addons/cdoFieldAngleTextInput';
import CdoFieldAnimationDropdown from './addons/cdoFieldAnimationDropdown';
import CdoFieldBehaviorPicker from './addons/cdoFieldBehaviorPicker';
import {CdoFieldBitmap} from './addons/cdoFieldBitmap';
import CdoFieldButton from './addons/cdoFieldButton';
import CdoFieldFlyout from './addons/cdoFieldFlyout';
import {CdoFieldImageDropdown} from './addons/cdoFieldImageDropdown';
import CdoFieldParameter from './addons/cdoFieldParameter';
import CdoFieldToggle from './addons/cdoFieldToggle';
import CdoFieldVariable from './addons/cdoFieldVariable';
import FunctionEditor from './addons/functionEditor';
import WorkspaceSvgFrame from './addons/workspaceSvgFrame';
import {
  BLOCK_TYPES,
  BlocklyVersion,
  Themes,
  WORKSPACE_EVENTS,
} from './constants';

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

export interface SerializedFields {
  [key: string]: {
    id?: string;
    name?: string;
  };
}

type GoogleBlocklyType = typeof GoogleBlockly;

// Type for the Blockly instance created and modified by googleBlocklyWrapper.
export interface BlocklyWrapperType extends GoogleBlocklyType {
  BlockFieldHelper: {[fieldHelper: string]: string};
  enableParamEditing: boolean;
  selected: BlockSvg;
  blockCountMap: Map<string, number> | undefined;
  blockLimitMap: Map<string, number> | undefined;
  readOnly: boolean;
  grayOutUndeletableBlocks: boolean;
  topLevelProcedureAutopopulate: boolean;
  getNewCursor: (type: string) => Cursor;
  LineCursor: typeof GoogleBlockly.BasicCursor;
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

  AngleHelper: typeof CdoAngleHelper;
  FieldAngleDropdown: typeof CdoFieldAngleDropdown;
  FieldAngleTextInput: typeof CdoFieldAngleTextInput;
  FieldBehaviorPicker: typeof CdoFieldBehaviorPicker;
  FieldButton: typeof CdoFieldButton;
  FieldImageDropdown: typeof CdoFieldImageDropdown;
  FieldAnimationDropdown: typeof CdoFieldAnimationDropdown;
  FieldToggle: typeof CdoFieldToggle;
  FieldFlyout: typeof CdoFieldFlyout;
  FieldBitmap: typeof CdoFieldBitmap;
  FieldVariable: typeof CdoFieldVariable;
  FieldParameter: typeof CdoFieldParameter;
  JavaScript: JavascriptGeneratorType;
  assetUrl: (path: string) => string;
  customSimpleDialog: (config: object) => void;
  levelBlockIds: Set<string>;
  isStartMode: boolean;
  isToolboxMode: boolean;
  toolboxBlocks: ToolboxDefinition | undefined;
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
  Generator: ExtendedGenerator;
  Xml: ExtendedXml;
  Procedures: ExtendedProcedures;
  BlockValueType: {[key: string]: string};
  SNAP_RADIUS: number;
  Variables: ExtendedVariables;
  hasLoadedBlocks: boolean;

  wrapReadOnlyProperty: (propertyName: string) => void;
  wrapSettableProperty: (propertyName: string) => void;
  overrideFields: (overrides: [string, string, FieldProto][]) => void;
  setInfiniteLoopTrap: () => void;
  clearInfiniteLoopTrap: () => void;
  getInfiniteLoopTrap: () => string;
  loopHighlight: (apiName: string, blockId: string) => string;
  getWorkspaceCode: () => string;
  addChangeListener: (
    blockspace: Workspace,
    handler: (e: Abstract) => void
  ) => void;
  getGenerator: () => JavascriptGeneratorType;
  addEmbeddedWorkspace: (workspace: Workspace) => void;
  isEmbeddedWorkspace: (workspace: Workspace) => boolean;
  findEmptyContainerBlock: (blocks: Block[]) => Block | null;
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
    block: ExtendedBlockSvg,
    pointerMetadataMap: PointerMetadataMap,
    imageSourceId: string
  ) => string;
}

export type GoogleBlocklyInstance = typeof GoogleBlockly;

// Extended types are Blockly types we have monkey patched in googleBlocklyWrapper.
// We have specific methods we rely on from CDO Blockly that we needed to continue to support,
// but Blockly does not support overriding their base classes. Therefore we create these Extended
// types and can cast to them when needed.

export interface ExtendedBlockSvg extends BlockSvg {
  isVisible: () => boolean;
  isUserVisible: () => boolean;
  shouldBeGrayedOut: () => boolean;
  // imageSourceId, shortString, longString and thumbnailSize are used for sprite pointer blocks
  imageSourceId?: string;
  shortString?: string;
  longString?: string;
  thumbnailSize?: number;
  // used for function blocks
  functionalSvg_?: BlockSvgFrame;
  blockSvgLimitIndicator?: BlockSvgLimitIndicator;
  workspace: ExtendedWorkspaceSvg;
}

export interface FieldHelperOptions {
  block: Block;
  directionTitle?: string; // Ex. 'DIR'
  direction?: string; // Ex. 'turnRight'
}

export interface FieldHelpers {
  [fieldHelper: string]: FieldHelperOptions;
}
export interface ExtendedInput extends Input {
  addFieldHelper: (
    fieldHelper: string,
    options: FieldHelperOptions
  ) => ExtendedInput;
  setStrictCheck: (check: string | string[] | null) => Input;
  // Blockly explicitly uses any for this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFieldRow: () => Field<any>[];
}
export interface ExtendedConnection extends Connection {
  getFieldHelperOptions: (fieldHelper: string) => FieldHelperOptions;
  fieldHelpers_: FieldHelpers;
  addFieldHelper(fieldHelper: string, options: FieldHelperOptions): unknown;
}

export interface ExtendedBlock extends Block {
  interpolateMsg: (
    this: ExtendedBlock,
    msg: string,
    ...inputArgs: [...([string, string, number] | (() => void))[], number]
  ) => void;
  setStrictOutput: (isOutput: boolean, check: string | string[] | null) => void;
  // Blockly uses any for value.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTitleValue: (newValue: any, name: string) => void;
  skipNextBlockGeneration?: boolean;
}

export interface ExtendedWorkspaceSvg extends WorkspaceSvg {
  flyoutParentBlock: Block | null;
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
  isReadOnly: () => boolean;
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
  levelBlockIds: Set<string>;
  isBlockEditMode: boolean;
  editBlocks: string | undefined;
  topLevelProcedureAutopopulate: boolean | undefined;
  noFunctionBlockFrame: boolean;
  useModalFunctionEditor: boolean;
  useBlocklyDynamicCategories: boolean;
  grayOutUndeletableBlocks: boolean | undefined;
  disableParamEditing: boolean;
}

export interface ExtendedWorkspace extends Workspace {
  noFunctionBlockFrame: boolean;
}

type CodeGeneratorType = typeof CodeGenerator;
export interface ExtendedGenerator extends CodeGeneratorType {
  xmlToCode: (name: string, domBlocks: Element) => string;
  xmlToBlocks: (name: string, xml: Element) => Block[];
  blockSpaceToCode: (
    name: string,
    opt_typeFilter?: string | string[]
  ) => string;
  blocksToCode: (name: string, blocksToGenerate: Block[]) => string;
  prefixLines: (text: string, prefix: string) => string;
  nameDB_: Names | undefined;
  variableDB_: Names | undefined;
}

type XmlType = typeof Xml;
export interface ExtendedXml extends XmlType {
  textToDom: (text: string) => Element;
  blockSpaceToDom: (workspace: Workspace, opt_noId?: boolean) => Element;
  domToBlockSpace: (workspace: Workspace, xml: Element) => XmlBlockConfig[];
}

// This type is likely incomplete. We should add to it if we discover
// more properties it contains.
export interface XmlBlockConfig {
  blockly_block: Block;
  x: number;
  y: number;
}

// This type is likely incomplete. We should add to it if we discover
// more properties it contains.
export interface JsonBlockConfig {
  id?: string;
  x?: number;
  y?: number;
  movable?: boolean;
  deletable?: boolean;
  // extraState can be any object. We may be able to define this better.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraState?: any;
  type: string;
  fields: {[key: string]: {name: string; type: string; id?: string}};
  inputs: {[key: string]: {block: JsonBlockConfig}};
  next: {block: JsonBlockConfig};
  kind: string;
}

export interface Collider {
  x: number;
  y: number;
  height: number;
  width: number;
}

type ProceduresType = typeof Procedures;

export interface ExtendedProcedures extends ProceduresType {
  DEFINITION_BLOCK_TYPES: string[];
}

type VariablesType = typeof Variables;
export interface ExtendedVariables extends VariablesType {
  DEFAULT_CATEGORY: string;
  getters: {[key: string]: string};
  registerGetter: (category: string, blockName: string) => void;
  allVariablesFromBlock: (block: Block) => string[];
  getVars: (opt_category?: string) => {[key: string]: string[]};
}

export interface ProcedureBlock extends ExtendedBlockSvg, IProcedureBlock {
  invisible: boolean;
  userCreated: boolean;
  getTargetWorkspace_(): Workspace;
  hasReturn_: boolean;
  renameProcedure(
    oldName: string,
    newName: string,
    userCreated?: boolean
  ): void;
  defType_: string;
  model_: IProcedureModel;
  paramsFromSerializedState_: string[];
  updateArgsMap_: () => void;
  eventIsCreatingThisBlockDuringPaste_: (event: Abstract) => boolean;
  defMatches_: (defBlock: ProcedureBlock) => boolean;
  createDef_: (name: string, params?: string[]) => IProcedureModel;
  findProcedureModel_: (name: string, params?: string[]) => IProcedureModel;
  initBlockWithProcedureModel_: () => void;
  noBlockHasClaimedModel_: (procedureId: string) => boolean;
  setStatements_: (hasStatements: boolean) => void;
  deserialize_: (name: string, params: string[]) => void;
  createArgInputs_: (params: string[]) => void;
  updateName_: () => void;
  updateEnabled_: () => void;
  updateParameters_: () => void;
  hasStatements_: boolean;
  description?: string | null;
  // used for behavior blocks
  behaviorId?: string | null;
}

// Blockly uses {[key: string]: any} to define workspace serialization.
// We have defined this more specifically, and therefore need to cast
// to this value when getting the serialzation of a workspace.
export type WorkspaceSerialization =
  | {
      blocks: {blocks: JsonBlockConfig[]};
      procedures?: ProcedureDefinitionConfig[];
      variables?: VariableConfig[];
    }
  | Record<string, never>; // empty object

export interface ProcedureDefinitionConfig {
  id: string;
  name: string;
  // As of now we only use null. Will we ever use return types?
  returnTypes: null;
}

export interface VariableConfig {
  name: string;
  id: string;
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

export type PointerMetadataMap = {
  [blockType: string]: {
    imageSourceType: string;
    imageIndex: number;
  };
};

export type BlockColor = [number, number, number];

// Blockly defines this as any.
export type JavascriptGeneratorType = typeof javascriptGenerator;
