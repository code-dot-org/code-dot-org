import React from 'react';
import ReactDOM from 'react-dom';
import msg from '@cdo/locale';
import {getFirstParam} from '../dropletUtils';
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
  return function() {
    return [
      {
        text: msg.choosePrefix(),
        display:
          '<span class="chooseAssetDropdownOption">' +
          msg.choosePrefix() +
          '</a>',
        click: callback => openModal(ParamType.TABLE, callback)
      }
    ];
  };
}

function getTableNameFromColumnSocket(socket, editor) {
  const paramValue = getFirstParam('getColumn', socket.parent, editor);
  // The socket value has an extra set of double quotes. Trim off the first
  // and last characters to remove, but don't use utils.stripQuotes because
  // there may be other quotes in the table name (for example, apostrophes)
  return paramValue.substring(1, paramValue.length - 1);
}

export function getColumns() {
  return function(editor) {
    const tableName = getTableNameFromColumnSocket(this, editor);
    return [
      {
        text: msg.choosePrefix(),
        display:
          '<span class="chooseAssetDropdownOption">' +
          msg.choosePrefix() +
          '</a>',
        click: callback => openModal(ParamType.COLUMN, callback, tableName)
      }
    ];
  };
}

export var __TestInterface = {
  getTableNameFromColumnSocket: getTableNameFromColumnSocket
};
