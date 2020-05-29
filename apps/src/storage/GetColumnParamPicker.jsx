import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import color from '../util/color';
import {getStore} from '@cdo/apps/redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';

export const ParamType = {
  TABLE: 'TABLE',
  COLUMN: 'COLUMN'
};

const styles = {
  title: {
    paddingLeft: '1em',
    fontFamily: "'Gotham 7r', sans-serif",
    color: color.teal
  },
  option: {
    paddingLeft: '2em',
    fontFamily: "'Gotham 7r', sans-serif",
    color: color.purple
  }
};

export default class GetColumnParamPicker extends React.Component {
  static propTypes = {
    param: PropTypes.oneOf(Object.values(ParamType)).isRequired,
    table: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onChoose: PropTypes.func.isRequired
  };

  state = {columns: []};

  componentDidMount() {
    if (this.props.param === ParamType.COLUMN) {
      const reduxState = getStore().getState();
      Applab.storage
        .getColumnsForTable(
          this.props.table,
          reduxState.data.tableListMap[this.props.table]
        )
        .then(columns => this.setState({columns: columns}));
    }
  }

  chooseOption(option) {
    this.props.onChoose(option);
    this.props.onClose();
    return false;
  }

  render() {
    let options = [];
    if (this.props.param === ParamType.TABLE) {
      const reduxState = getStore().getState();
      options = Object.keys(reduxState.data.tableListMap);
    } else if (this.props.param === ParamType.COLUMN) {
      options = this.state.columns;
    }
    return (
      <BaseDialog isOpen useUpdatedStyles handleClose={this.props.onClose}>
        <h1 style={styles.title}>
          {this.props.param === ParamType.TABLE
            ? msg.chooseTable()
            : msg.chooseColumn({table: this.props.table})}
        </h1>
        <div>
          {options.map(option => (
            <p key={option}>
              <a
                href="#"
                onClick={() => this.chooseOption(option)}
                style={styles.option}
              >
                {option}
              </a>
            </p>
          ))}
        </div>
      </BaseDialog>
    );
  }
}
