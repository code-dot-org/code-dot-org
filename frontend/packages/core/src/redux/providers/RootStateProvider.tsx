import type {FunctionComponent, PropsWithChildren} from 'react';
import {Provider} from 'react-redux';

import store from '../store';

const RootStateProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => <Provider store={store}>{children}</Provider>;

export default RootStateProvider;
