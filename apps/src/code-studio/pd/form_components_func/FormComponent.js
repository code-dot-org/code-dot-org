import React from 'react';

export const FormContext = React.createContext({});

/**
 * @param {String} name
 * @param {Array<String>} errors
 * @returns {String|undefined}
 */
export const getValidationState = (name, errors) => {
  if (errors.includes(name)) {
    return 'error';
  }
};
