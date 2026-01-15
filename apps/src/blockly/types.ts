import {
  ObservableParameterModel,
  ObservableProcedureModel,
} from '@blockly/block-shareable-procedures';
import {FieldColour} from '@blockly/field-colour';
import {KeyboardNavigation} from '@blockly/keyboard-navigation';
import * as BlocklyCore from 'blockly/core';
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
import {BLOCK_TYPES, BlockStyles, Themes, WORKSPACE_EVENTS} from './constants';

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
  returnType?: string;
}

export interface arg {
  customInput: string;
  name: string;
  options?: [string, string][];
}

export interface SerializedFields {
  [key: string]: {
    id?: string;
    name?: string;
  };
}

export interface InputConfig {
  label: string;
  mode: string;
  name: string;
  strict: boolean;
}

export interface CustomInputTypes {
  [key: string]: {
    addInput?: (
      blockly: BlocklyCoreType,
      block: BlocklyCore.Block,
      inputConfig: InputConfig,
      currentInputRow: BlocklyCore.Input
    ) => void;
    generateCode?: (
      block: BlocklyCore.Block,
      inputConfig: InputConfig
    ) => string;
    openEditor?: (event: UIEvent) => void;
  };
}

interface AnalyticsData {
  appType: string;
  scriptName?: string;
  scriptId?: number;
  levelId?: number;
}

type BlocklyCoreType = typeof BlocklyCore;
// Type for the Blockly instance created and modified by blocklyWrapper.
export interface BlocklyWrapperType extends BlocklyCoreType {
  isDarkTheme: boolean | undefined;
  varsInGlobals: boolean;
  disableVariableEditing: boolean;
  ALIGN_CENTRE: BlocklyCore.inputs.Align.CENTRE;
  ALIGN_LEFT: BlocklyCore.inputs.Align.LEFT;
  ALIGN_RIGHT: BlocklyCore.inputs.Align.RIGHT;
  inputTypes: typeof BlocklyCore.inputs.inputTypes;
  createSvgElement: typeof BlocklyCore.utils.dom.createSvgElement;
  analyticsData: AnalyticsData;
  showUnusedBlocks: boolean | undefined;
  BlockFieldHelper: {[fieldHelper: string]: string};
  enableParamEditing: boolean;
  selected: BlocklyCore.BlockSvg;
  blockCountMap: Map<string, number> | undefined;
  blockLimitMap: Map<string, number> | undefined;
  grayOutUndeletableBlocks: boolean;
  topLevelProcedureAutopopulate: boolean;
  isJigsaw: boolean;
  blockly_: typeof BlocklyCore;
  mainWorkspace: BlocklyCore.WorkspaceSvg | undefined;
  embeddedWorkspaces: string[];
  procedureSerializer: BlocklyCore.serialization.procedures.ProcedureSerializer<
    ObservableProcedureModel,
    ObservableParameterModel
  >;
  themes: {[key in Themes]: BlocklyCore.Theme};
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
  FieldColour: typeof FieldColour;
  FieldVariable: typeof CdoFieldVariable;
  FieldParameter: typeof CdoFieldParameter;
  JavaScript: JavascriptGeneratorType;
  assetUrl: (path: string) => string;
  customSimpleDialog: (config: object) => void;
  levelBlockIds: Set<string>;
  isStartMode: boolean;
  isToolboxMode: boolean;
  toolboxBlocks: BlocklyCore.utils.toolbox.ToolboxDefinition | undefined;
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
  Generator: ExtendedCodeGenerator;
  Xml: ExtendedXml;
  Procedures: ExtendedProcedures;
  BlockValueType: {[key: string]: string};
  SNAP_RADIUS: number;
  Variables: ExtendedVariables;
  hasLoadedBlocks: boolean;
  showBlockHelp: boolean;

  wrapReadOnlyProperty: (propertyName: string) => void;
  wrapSettableProperty: (propertyName: string) => void;
  overrideFields: (
    overrides: [string, string, BlocklyCore.fieldRegistry.RegistrableField][]
  ) => void;
  setInfiniteLoopTrap: () => void;
  clearInfiniteLoopTrap: () => void;
  getInfiniteLoopTrap: () => string | null;
  loopHighlight: (apiName: string, blockId: string) => string;
  getWorkspaceCode: () => string;
  addChangeListener: (
    blockspace: BlocklyCore.Workspace,
    handler: (e: BlocklyCore.Events.Abstract) => void
  ) => void;
  removeChangeListener: (
    handler: (e: BlocklyCore.Events.Abstract) => void,
    blockspace: BlocklyCore.Workspace
  ) => void;
  getGenerator: () => ExtendedJavascriptGenerator;
  addEmbeddedWorkspace: (workspace: BlocklyCore.Workspace) => void;
  isEmbeddedWorkspace: (workspace: BlocklyCore.Workspace) => boolean;
  findEmptyContainerBlock: (
    blocks: BlocklyCore.Block[]
  ) => BlocklyCore.Block | null;
  createEmbeddedWorkspace: (
    container: HTMLElement,
    xml: Node,
    options: BlocklyCore.BlocklyOptions
  ) => BlocklyCore.WorkspaceSvg;
  setMainWorkspace: (workspace: BlocklyCore.WorkspaceSvg) => void;
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
  blockIdOverrides: {
    [originalBlockId: string]: string;
  };
  KeyboardNavigation?: typeof KeyboardNavigation;
  shortcutBackups: {
    [name: string]: BlocklyCore.ShortcutRegistry.KeyboardShortcut | undefined;
  };
  extraScrollHeight?: number;
  /** Maintains the original English forms of Msg.* strings */
  SourceMsg: {[key: string]: string};
  /** Maintains the original English names of provided variables in flyouts, toolboxes, etc */
  SourceVariables: {[key: string]: string};
  /** Keeps track of the original inputTypes passed in when predefined in level metadata */
  SourceCustomInputTypes: CustomInputTypes;
  /**
   * Keeps track of custom blocks provided into installCustomBlocks such that we have the
   * original forms so that we can localize them when re-serializing the workspace on a
   * locale change.
   */
  SourceCustomBlocks: {
    blockDefinitionsByName: {
      [key: string]: BlockDefinition;
    };
    blockTexts: {
      [key: string]: string;
    };
  };
}

export type BlocklyCoreInstance = typeof BlocklyCore;

// Extended types are Blockly types we have monkey patched in blocklyWrapper.
// We have specific methods we rely on from CDO Blockly that we needed to continue to support,
// but Blockly does not support overriding their base classes. Therefore we create these Extended
// types and can cast to them when needed.

export interface ExtendedBlockSvg extends BlocklyCore.BlockSvg {
  canSerializeNextConnection?: boolean;
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
  block: BlocklyCore.Block;
  directionTitle?: string; // Ex. 'DIR'
  direction?: string; // Ex. 'turnRight'
}

export interface FieldHelpers {
  [fieldHelper: string]: FieldHelperOptions;
}
export interface ExtendedInput extends BlocklyCore.Input {
  addFieldHelper: (
    fieldHelper: string,
    options: FieldHelperOptions
  ) => ExtendedInput;
  setStrictCheck: (check: string | string[] | null) => BlocklyCore.Input;
  // Blockly explicitly uses any for this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFieldRow: () => BlocklyCore.Field<any>[];
}
export interface ExtendedConnection extends BlocklyCore.Connection {
  getFieldHelperOptions: (fieldHelper: string) => FieldHelperOptions;
  fieldHelpers_: FieldHelpers;
  addFieldHelper(fieldHelper: string, options: FieldHelperOptions): unknown;
}

export interface ExtendedBlock extends BlocklyCore.Block {
  getFillPattern: () => string | undefined;
  fillPattern?: string;
  setFillPattern: (pattern: string) => void;
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
  svgPathFill: SVGElement;
}

export interface ExtendedWorkspaceSvg extends BlocklyCore.WorkspaceSvg {
  defs: SVGElement;
  previousViewWidth: number;
  flyoutParentBlock: BlocklyCore.Block | null;
  globalVariables: string[];
  sourceGlobalVariables: string[];
  noFunctionBlockFrame: boolean;
  events: {
    dispatchEvent: () => void;
  };
  addUnusedBlocksHelpListener: () => void;
  getAllUsedBlocks: () => BlocklyCore.Block[];
  registerGlobalVariables: (variableList: string[]) => void;
  getVariableMap: () => ExtendedVariableMap;
  getContainer: () => ParentNode | null;
  setEnableToolbox: () => void;
  traceOn: () => void;
  isReadOnly: () => boolean;
  cleanUp: (includeImmovableBlocks?: boolean) => void;
  getBlockCount: () => number;
}

export interface EditorWorkspaceSvg extends ExtendedWorkspaceSvg {
  svgFrame_: WorkspaceSvgFrame;
}

export interface ExtendedVariableMap extends BlocklyCore.VariableMap {
  addVariables: (variableList: string[]) => void;
}

export interface ExtendedBlocklyOptions extends BlocklyCore.BlocklyOptions {
  varsInGlobals: boolean;
  disableVariableEditing: boolean;
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
  showUnusedBlocks: boolean | undefined;
  analyticsData: AnalyticsData;
  isJigsaw: boolean;
  enableKeyboardNavigation: boolean;
  showBlockHelp: boolean;
}

export interface ExtendedWorkspace extends BlocklyCore.Workspace {
  noFunctionBlockFrame: boolean;
}

type CodeGeneratorType = typeof BlocklyCore.CodeGenerator;
export interface ExtendedCodeGenerator extends CodeGeneratorType {
  xmlToCode?: (name: string, domBlocks: Element) => string;
  xmlToBlocks: (name: string, xml: Element) => BlocklyCore.Block[];
  blockSpaceToCode: (
    name: string,
    opt_typeFilter?: string | string[]
  ) => string;
  blocksToCode: (name: string, blocksToGenerate: BlocklyCore.Block[]) => string;
  prefixLines: (text: string, prefix: string) => string;
  nameDB_: BlocklyCore.Names | undefined;
  variableDB_: BlocklyCore.Names | undefined;
  prototype: typeof BlocklyCore.CodeGenerator.prototype;
  translateVarName: (name: string) => string;
}

type XmlType = typeof BlocklyCore.Xml;
export interface ExtendedXml extends XmlType {
  textToDom: (text: string) => Element;
  blockSpaceToDom: (
    workspace: BlocklyCore.Workspace,
    opt_noId?: boolean
  ) => Element;
  domToBlockSpace: (
    workspace: BlocklyCore.Workspace,
    xml: Element
  ) => XmlBlockConfig[];
}

// This type is likely incomplete. We should add to it if we discover
// more properties it contains.
export interface XmlBlockConfig {
  blockly_block: BlocklyCore.Block;
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
  fields?: {
    [key: string]: {name: string; type: string; id?: string} | string | number;
  };
  inputs?: {[key: string]: {block: JsonBlockConfig}};
  next?: {block: JsonBlockConfig};
  kind?: string;
}

export interface Collider {
  x: number;
  y: number;
  height: number;
  width: number;
}

type ProceduresType = typeof BlocklyCore.Procedures;

export interface ExtendedProcedures extends ProceduresType {
  DEFINITION_BLOCK_TYPES: string[];
}

type VariablesType = typeof BlocklyCore.Variables;
export interface ExtendedVariables extends VariablesType {
  DEFAULT_CATEGORY: string;
  getters: {[key: string]: string};
  registerGetter: (category: string, blockName: string) => void;
  allVariablesFromBlock: (block: BlocklyCore.Block) => string[];
  getVars: (opt_category?: string) => string[];
}

export interface ProcedureBlock
  extends ExtendedBlockSvg,
    BlocklyCore.Procedures.IProcedureBlock {
  invisible: boolean;
  userCreated: boolean;
  getTargetWorkspace_(): BlocklyCore.Workspace;
  hasReturn_: boolean;
  renameProcedure(
    oldName: string,
    newName: string,
    userCreated?: boolean
  ): void;
  defType_: string;
  model_: BlocklyCore.Procedures.IProcedureModel;
  paramsFromSerializedState_: string[];
  updateArgsMap_: () => void;
  eventIsCreatingThisBlockDuringPaste_: (
    event: BlocklyCore.Events.Abstract
  ) => boolean;
  defMatches_: (defBlock: ProcedureBlock) => boolean;
  createDef_: (
    name: string,
    params?: string[]
  ) => BlocklyCore.Procedures.IProcedureModel;
  findProcedureModel_: (
    name: string,
    params?: string[]
  ) => BlocklyCore.Procedures.IProcedureModel;
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
  prevParams_: BlocklyCore.Procedures.IParameterModel[];
  argsMap_: Map<string, BlocklyCore.Block>;
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
    expectedRootBlockType: string;
    imageIndex: number;
  };
};

export type BlockColor = [number, number, number];

export type GeneratorFunction = (
  block: BlocklyCore.Block,
  generator: BlocklyCore.CodeGenerator
) => string | [string, number] | null;

export type JavascriptGeneratorType = typeof javascriptGenerator;
export interface ExtendedJavascriptGenerator
  extends ExtendedCodeGenerator,
    JavascriptGeneratorType {
  nameDB_: BlocklyCore.Names | undefined;
  forBlock: Record<string, GeneratorFunction>;
}

export interface BlockJson<BlockType extends string = string> {
  type: BlockType;
  [key: `message${number}`]: string | undefined;
  [key: `args${number}`]: ArgumentJson[];
  style?: BlockStyles;
  inputsInline?: boolean;
  previousStatement?: string | string[] | null;
  nextStatement?: string | string[] | null;
  output?: string | string[] | null;
  tooltip?: string;
  helpUrl?: string;
}

// Add more field/input definitions as needed
type ArgumentJson = FieldJson | FieldInput | FieldDropdown;

interface FieldJson {
  type: string;
  name: string;
}

interface FieldInput extends FieldJson {
  type: 'field_input';
}

interface FieldDropdown extends FieldJson {
  type: 'field_dropdown';
  options: [string, string][];
}
