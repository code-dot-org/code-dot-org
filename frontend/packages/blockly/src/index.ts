export {default as BaseBlocks} from './blocks';
export * from './constants';
export * from './types';
export * from './toolbox';
export * as serialization from './serialization';
export * as xml from './xml';
export {defineMixin} from './mixins/defineMixin';
export {defineMutator} from './mutators/defineMutator';
export {defineExtension} from './extensions/defineExtension';
export {defineBlock} from './blocks/defineBlock';
export {createInjectPlugin, PluginType} from './plugins';
export {TopLeftMetricsManager} from './metricsManager';
// The dragger inject option that pairs with the scrollOptions plugin
// (`@code-dot-org/blockly/plugins/scrollOptions`). Re-exported so consumers wire
// it without depending on the plugin package directly.
export {ScrollBlockDragger} from '@blockly/plugin-scroll-options';
export type {
  FieldPlugin,
  InjectPlugin,
  InputPlugin,
  InjectSetupFunction,
  InjectReadyFunction,
  InjectDisposeFunction,
} from './plugins';
// Input plugins define the connection notch shape for a given type string;
// supply them via the workspace/provider `plugins` prop.
export * from './inputs';

export * from './components';
export * from './contexts';
export * from './fields';

export * as Blockly from 'blockly/core';
