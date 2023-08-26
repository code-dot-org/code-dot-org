import React from 'react';
import commonMsg from '@cdo/locale';
import commonStyles from '../../commonStyles';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './delete-element-button.module.scss';

/**
 * A delete button that will also ask for confirmation when shouldConfirm is
 * true.
 */
class DeleteElementButton extends React.Component {
  static propTypes = {
    shouldConfirm: PropTypes.bool.isRequired,
    handleDelete: PropTypes.func.isRequired,
  };

  state = {
    confirming: false,
  };

  handleDeleteInternal = event => {
    if (this.props.shouldConfirm) {
      this.setState({confirming: true});
    } else {
      this.finishDelete();
    }
  };

  finishDelete = () => this.props.handleDelete();

  abortDelete = event => this.setState({confirming: false});

  render() {
    if (this.state.confirming) {
      return (
        <div className={classNames(style.right, style.confirming)}>
          {commonMsg.deleteConfirm()}
          <button
            type="button"
            className={style.red}
            style={commonStyles.button}
            onClick={this.finishDelete}
          >
            {commonMsg.yes()}
          </button>
          <button
            type="button"
            style={commonStyles.button}
            onClick={this.abortDelete}
          >
            {commonMsg.no()}
          </button>
        </div>
      );
    }
    return (
      <div>
        <button
          type="button"
          style={commonStyles.button}
          className={classNames(style.red, style.right)}
          onClick={this.handleDeleteInternal}
        >
          {commonMsg.delete()}
        </button>
      </div>
    );
  }
}

export default DeleteElementButton;
