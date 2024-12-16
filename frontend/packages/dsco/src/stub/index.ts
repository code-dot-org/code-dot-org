export {Stub, Stub as default} from './Stub';
export type {StubProps} from './Stub';
import type {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const StubContentfulComponentDefinition: ComponentDefinition = {
  id: 'stub',
  name: 'Stub',
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
