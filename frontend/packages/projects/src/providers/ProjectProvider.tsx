import React, {PropsWithChildren} from "react";
import {Provider} from "react-redux";

import store from "../stores/project";

const ProjectProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => (
  <Provider store={store}>
    {children}
  </Provider>
);

export default ProjectProvider;
