// this file should only be loaded directly if necessary to break a circular dependency
// otherwise import the full project object from the directory path.
//
// import project from "./code-studio/initApp/project"

let currentIdVal = undefined;

export const getCurrentId = () => currentIdVal;
export const setCurrentId = newCurrentIdVal => (currentIdVal = newCurrentIdVal);
