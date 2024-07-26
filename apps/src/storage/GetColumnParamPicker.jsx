import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import {getStore} from '@cdo/apps/redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import msg from '@cdo/locale';

import color from '../util/color';

export const ParamType = {
  TABLE: 'TABLE',
  COLUMN: 'COLUMN',
};

export default class GetColumnParamPicker extends React.Component {
  static propTypes = {
    param: PropTypes.oneOf(Object.values(ParamType)).isRequired,
    table: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onChoose: PropTypes.func.isRequired,
  };

  state = {columns: []};

  componentDidMount() {
    if (this.props.param === ParamType.COLUMN) {
      Applab.storage
        .getColumnsForTable(this.props.table)
        .then(columns => this.setState({columns: columns}));
    }
  }

  chooseOption(option) {
    this.props.onChoose(option);
    this.props.onClose();
    return false;
  }

  render() {
    const reduxState = getStore().getState();
    let options = [];
    let title = '';
    let error = '';
    switch (this.props.param) {
      case ParamType.TABLE:
        options = Object.keys(reduxState.data.tableListMap);
        title = msg.chooseTable();
        error = msg.noTablesInProject();
        break;
      case ParamType.COLUMN:
        options = this.state.columns;
        title = msg.chooseColumn({table: this.props.table});
        error = msg.noColumnsInTable({table: this.props.table});
        break;
      default:
    }
    return (
      <BaseDialog isOpen useUpdatedStyles handleClose={this.props.onClose}>
        <h1 style={styles.title}>{title}</h1>
        <div>
          {options.length === 0 ? (
            <p style={styles.error}>{error}</p>
          ) : (
            options.map(option => (
              <p key={option}>
                <a
                  href="#"
                  onClick={() => this.chooseOption(option)}
                  style={styles.option}
                >
                  {option}
                </a>
              </p>
            ))
          )}
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  title: {
    paddingLeft: '15px',
    ...fontConstants['main-font-bold'],
    color: color.teal,
  },
  option: {
    paddingLeft: '30px',
    ...fontConstants['main-font-bold'],
    color: color.purple,
  },
  error: {
    padding: '30px',
  },
};
