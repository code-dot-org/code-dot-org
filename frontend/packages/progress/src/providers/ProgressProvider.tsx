import React, {PropsWithChildren} from "react";
import {Provider} from "react-redux";

import store from "../stores/progress";

const ProgressProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => (
  <Provider store={store}>
    {children}
  </Provider>
);

export default ProgressProvider;
