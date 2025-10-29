import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {ChatPrompt} from '../../../aiDifferentiation/types';
import {setChatInitialThreadPrompt} from '../slice';

export const setInitialThreadPrompt = (
  dispatch: AppDispatch,
  chatInitialThreadPrompt: ChatPrompt | null
) => dispatch(setChatInitialThreadPrompt(chatInitialThreadPrompt));
