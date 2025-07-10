import {updateAndSaveSource} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

export const useUpdateSource = (
  updateCallback: (source: MultiFileSource) => MultiFileSource
) => {
  const dispatch = useAppDispatch();
  const updateSource = dispatch(
    updateAndSaveSource({
      updateCallback,
    })
  );
  return updateSource;
};
