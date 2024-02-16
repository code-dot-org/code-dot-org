import {BlockSvg, Theme, Workspace, WorkspaceSvg} from 'blockly';
import GoogleBlockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import SvgFrame from './addons/svgFrame';
import {BlocklyVersion, Themes} from './constants';
import {FieldProto} from 'blockly/core/field';
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
import CdoBlockSvg from './addons/cdoBlockSvg';
import CdoInput from './addons/cdoInput';

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

export type BlocklyWrapperType = typeof GoogleBlockly & {
  version: BlocklyVersion;
  blockly_: typeof GoogleBlockly;
  mainWorkspace: GoogleBlockly.WorkspaceSvg | undefined;
  embeddedWorkspaces: GoogleBlockly.WorkspaceSvg[];
  procedureSerializer: ProcedureSerializer<
    ObservableProcedureModel,
    ObservableParameterModel
  >;
  themes: {[key in Themes]: Theme};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigationController: any; // Navigation Controller is not typed by Blockly

  FieldButton: typeof CdoFieldButton;
  FieldImageDropdown: typeof CdoFieldImageDropdown;
  FieldToggle: typeof CdoFieldToggle;
  FieldFlyout: typeof CdoFieldFlyout;
  JavaScript: typeof javascriptGenerator;
  BlockSvg: typeof CdoBlockSvg;
  Input: typeof CdoInput;

  wrapReadOnlyProperty: (propertyName: string) => void;
  wrapSettableProperty: (propertyName: string) => void;
  overrideFields: (overrides: [string, string, FieldProto][]) => void;
  setInfiniteLoopTrap: () => void;
  clearInfiniteLoopTrap: () => void;
  getInfiniteLoopTrap: () => string;
  loopHighlight: () => void;
  getWorkspaceCode: () => string;
  getHiddenDefinitionWorkspace: () => WorkspaceSvg;
  addChangeListener: (
    blockspace: Workspace,
    handler: (e: Abstract) => void
  ) => void;
};

export type GoogleBlocklyWorkspace = Workspace & {
  noFunctionBlockFrame?: boolean;
  svgFrame_?: SvgFrame;
};
