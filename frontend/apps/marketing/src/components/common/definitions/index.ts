import {ComponentDefinitionVariable} from '@contentful/experiences-core/types';

export const componentSizeXSToLDefinition: ComponentDefinitionVariable = {
  displayName: 'Size',
  type: 'Text',
  group: 'style',
  defaultValue: 'm',
  validations: {
    in: [
      {value: 'l', displayName: 'Large'},
      {value: 'm', displayName: 'Medium'},
      {value: 's', displayName: 'Small'},
      {value: 'xs', displayName: 'Extra Small'},
    ],
  },
};

export const marginBottomNoneToMDefinition = {
  displayName: 'Margin bottom',
  type: 'Text',
  defaultValue: 'xs',
  group: 'style',
  validations: {
    in: [
      {value: 'none', displayName: 'None'},
      {value: 'xs', displayName: 'Extra Small'},
      {value: 's', displayName: 'Small'},
      {value: 'm', displayName: 'Medium'},
    ],
  },
};

export const removeMarginBottomDefinition: ComponentDefinitionVariable = {
  displayName: 'Remove margin bottom?',
  type: 'Boolean',
  defaultValue: false,
  group: 'style',
};
