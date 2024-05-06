import {useCDOIDEContext} from '@cdo/apps/codebridge/codebridgeContext';
import {getEmptyEditor} from '@cdo/apps/codebridge/utils';

export const useEmptyEditor = () => {
  const {config} = useCDOIDEContext();
  return getEmptyEditor(config);
};
