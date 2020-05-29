import PropTypes from 'prop-types';
import React from 'react';
import {getStore} from '@cdo/apps/redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';

export const ParamType = {
  TABLE: 'TABLE',
  COLUMN: 'COLUMN'
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
      <BaseDialog isOpen handleClose={this.props.onClose}>
        <div>
          {options.map(option => (
            <p key={option}>
              <a href="#" onClick={() => this.chooseOption(option)}>
                {option}
              </a>
            </p>
          ))}
        </div>
      </BaseDialog>
    );
  }
}
