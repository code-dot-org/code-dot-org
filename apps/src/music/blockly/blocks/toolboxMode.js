import {BlockTypes} from '../blockTypes';
import {categoryTypeToLocalizedName, dynamicCategories} from '../toolbox';
import {Category} from '../toolbox/types';

const staticCategories = Object.values(Category).filter(
  category => !dynamicCategories.includes(category)
);

const staticCategoryOptions = staticCategories.map(category => [
  categoryTypeToLocalizedName[category],
  category,
]);

const dynamicCategoryOptions = dynamicCategories.map(category => [
  categoryTypeToLocalizedName[category],
  category,
]);

/**
 * Represents a dynamic category block definition for Blockly.
 * This block allows levelbuilder to specify the start of a new category
 * when in toolbox mode.
 */
export const staticCategoryBlock = {
  definition: {
    type: BlockTypes.CATEGORY,
    message0: 'Category %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'CATEGORY',
        options: staticCategoryOptions,
      },
    ],
    inputsInline: true,
    style: 'loop_blocks',
    tooltip:
      'Indicates the start of a new category. All blocks below this point will be contained in this category.',
  },
  generator: () => '\n',
};

/**
 * Represents a dynamic category block definition for Blockly. This block allows
 * levelbuilders to create auto-populated Functions or Variables categories when
 * in toolbox mode.
 */
export const dynamicCategoryBlock = {
  definition: {
    type: BlockTypes.CUSTOM_CATEGORY,
    message0: 'Auto-populated Category %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'CUSTOM',
        options: dynamicCategoryOptions,
      },
    ],
    inputsInline: true,
    style: 'loop_blocks',
    tooltip:
      'Indicates an auto-populated (dynamic) category. Cannot include other static blocks.',
  },
  generator: () => '\n',
};
