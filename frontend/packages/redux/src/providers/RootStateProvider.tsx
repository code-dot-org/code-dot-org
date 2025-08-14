import React, {PropsWithChildren} from "react";
import {Provider} from "react-redux";
import type {Store} from 'redux';

import store from "../store";

const RootStateProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => (
  <Provider store={store}>
    {children}
  </Provider>
);

export default RootStateProvider;
