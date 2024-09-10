import React from 'react';
import ReactDOM from 'react-dom';

import msg from '@cdo/locale';

import {getFirstParam} from '../dropletUtils';
import {stripEncapsulatingDoubleQuotes} from '../utils';

import GetColumnParamPicker, {ParamType} from './GetColumnParamPicker';

function openModal(type, callback, table) {
  const modalDiv = document.createElement('div');
  modalDiv.setAttribute('id', 'modalDiv');
  document.body.appendChild(modalDiv);
  ReactDOM.render(
    <GetColumnParamPicker
      param={type}
      table={table}
      onChoose={option => callback(`"${option}"`)}
      onClose={() => {
        var element = document.getElementById('modalDiv');
        element.parentNode.removeChild(element);
      }}
    />,
    document.querySelector('#modalDiv')
  );
}

export function getTables() {
  return function () {
    return [
      {
        text: msg.choosePrefix(),
        display:
          '<span class="chooseAssetDropdownOption">' +
          msg.choosePrefix() +
          '</a>',
        click: callback => openModal(ParamType.TABLE, callback),
      },
    ];
  };
}

function getTableNameFromColumnSocket(socket, editor) {
  const paramValue = getFirstParam('getColumn', socket.parent, editor);

  // The socket value (ex. the table name) has an extra set of double quotes in Droplet mode but not in text mode
  // Note: formatParamString is what removes the double quotes before we get here in text mode
  return stripEncapsulatingDoubleQuotes(paramValue);
}

export function getColumns() {
  return function (editor) {
    const tableName = getTableNameFromColumnSocket(this, editor);
    return [
      {
        text: msg.choosePrefix(),
        display:
          '<span class="chooseAssetDropdownOption">' +
          msg.choosePrefix() +
          '</a>',
        click: callback => openModal(ParamType.COLUMN, callback, tableName),
      },
    ];
  };
}

export var __TestInterface = {
  getTableNameFromColumnSocket: getTableNameFromColumnSocket,
};
