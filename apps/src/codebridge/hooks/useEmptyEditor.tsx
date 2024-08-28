import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {getEmptyEditor} from '@codebridge/utils';

export const useEmptyEditor = () => {
  const {config} = useCodebridgeContext();
  return getEmptyEditor(config);
};
