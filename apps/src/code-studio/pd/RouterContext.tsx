import React, {createContext} from 'react';
import {useNavigate} from 'react-router-dom';

export const RouterContext = createContext({
  router: {
    push: (_: string) => {},
    replace: (_: string) => {},
    createHref: (_: string) => {},
  },
});
export const RouterProvider = ({basename = '', ...props}) => {
  const {children} = props;

  const cleanSlashes = (...stringArgs: string[]): string =>
    stringArgs.map(string => '/' + string.replace(/^\/+|\/+$/g, '')).join('');

  const push = useNavigate();
  const replace = (path: string) => push(path, {replace: true});
  const createHref = (path = '') => cleanSlashes(basename, path);

  const router = {
    push,
    replace,
    createHref,
  };

  return (
    <RouterContext.Provider value={{router}}>{children}</RouterContext.Provider>
  );
};
