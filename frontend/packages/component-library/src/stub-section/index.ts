import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export {StubSection, StubSection as default} from './StubSection';
export type {StubSectionProps} from './StubSection';

export const StubSectionContentfulComponentDefinition: ComponentDefinition = {
  id: 'stubSection',
  name: 'StubSection',
  category: 'Custom Components',
  variables: {
    backgroundColor: {
      displayName: 'Background Color',
      type: 'Text',
      defaultValue: 'white',
    },
    label: {
      displayName: 'Label',
      type: 'Text',
      defaultValue: 'Enter text here',
    },
  },
};
