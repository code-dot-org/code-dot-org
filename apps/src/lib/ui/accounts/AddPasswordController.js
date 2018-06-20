import React from 'react';
import ReactDOM from 'react-dom';
import AddPasswordForm from './AddPasswordForm';

export default class AddPasswordController {
  constructor(mountPoint) {
    ReactDOM.render(<AddPasswordForm/>, mountPoint);
  }
}
