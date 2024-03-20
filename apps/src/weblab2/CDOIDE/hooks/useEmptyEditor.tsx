import {useCDOIDEContext} from '@cdoide/cdo-ide-context';
import {getEmptyEditor} from '@cdoide/utils';

export const useEmptyEditor = () => {
  const {config} = useCDOIDEContext();
  return getEmptyEditor(config);
};
