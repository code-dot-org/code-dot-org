import {useCDOIDEContext} from '@cdoide/cdoIDEContext';
import {getEmptyEditor} from '@cdoide/utils';

export const useEmptyEditor = () => {
  const {config} = useCDOIDEContext();
  return getEmptyEditor(config);
};
