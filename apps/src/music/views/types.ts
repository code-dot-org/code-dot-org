import {TypedUseSelectorHook, useSelector} from 'react-redux';

import {MusicState} from '../redux/musicRedux';

// useSelector hook for music Redux state
export const useMusicSelector: TypedUseSelectorHook<{music: MusicState}> =
  useSelector;
