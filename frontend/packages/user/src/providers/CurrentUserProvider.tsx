import React, {PropsWithChildren} from "react";
import {Provider} from "react-redux";

import store from "../stores/currentUser";

const CurrentUserProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => (
  <Provider store={store}>
    {children}
  </Provider>
);

export default CurrentUserProvider;
