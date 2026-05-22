import {BlockJson} from '@cdo/apps/blockly/types';
import localization from '@cdo/apps/localization';

/**
 * Localizes a modern block definition and returns the localized form of it.
 */
export function localizeBlockDefinition(blockDefinition: BlockJson): BlockJson {
  return {
    ...blockDefinition,
    tooltip:
      blockDefinition.tooltip !== undefined
        ? localization.translate(blockDefinition.tooltip)
        : undefined,
    message0:
      blockDefinition.message0 !== undefined
        ? localization.translate(blockDefinition.message0, ['blockly-block'])
        : undefined,
    message1:
      blockDefinition.message1 !== undefined
        ? localization.translate(blockDefinition.message1, ['blockly-block'])
        : undefined,
    message2:
      blockDefinition.message2 !== undefined
        ? localization.translate(blockDefinition.message2, ['blockly-block'])
        : undefined,
    message3:
      blockDefinition.message3 !== undefined
        ? localization.translate(blockDefinition.message3, ['blockly-block'])
        : undefined,
  };
}
