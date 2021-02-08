import PropTypes from 'prop-types';
import React from 'react';
import onClickOutside from 'react-onclickoutside';
import color from '@cdo/apps/util/color';
import {lessonEditorTableStyles} from './TableConstants';

const styles = {
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
    height: 30
  },
  remove: {
    fontSize: 14,
    color: 'white',
    background: color.dark_red,
    cursor: 'pointer',
    textAlign: 'center',
    minWidth: '50%',
    lineHeight: '30px'
  },
  edit: {
    fontSize: 14,
    color: 'white',
    background: color.default_blue,
    cursor: 'pointer',
    textAlign: 'center',
    minWidth: '50%',
    lineHeight: '30px'
  },
  save: {
    fontSize: 14,
    color: 'white',
    background: color.green,
    cursor: 'pointer',
    textAlign: 'center',
    minWidth: '50%',
    lineHeight: '30px'
  }
};

export default onClickOutside(
  class ObjectiveLine extends React.Component {
    static propTypes = {
      editing: PropTypes.bool,
      description: PropTypes.string.isRequired,
      onSave: PropTypes.func.isRequired,
      onEditCancel: PropTypes.func.isRequired,
      onEditClick: PropTypes.func.isRequired,
      onRemove: PropTypes.func.isRequired
    };

    constructor(props) {
      super(props);

      this.state = {
        description: props.description
      };
    }

    handleClickOutside = () => {
      if (this.props.editing) {
        this.props.onSave(this.state.description);
      }
    };

    handleCancelClick = () => {
      this.setState({description: this.props.description});
      this.props.onEditCancel();
    };

    render() {
      return (
        <tr>
          <td style={lessonEditorTableStyles.cell}>
            {this.props.editing ? (
              <input
                value={this.state.description}
                onChange={e =>
                  this.setState({
                    description: e.target.value
                  })
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    this.props.onSave(this.state.description);
                  }
                }}
                style={{
                  width: '98%'
                }}
                type="text"
              />
            ) : (
              <div>{this.state.description}</div>
            )}
          </td>
          {this.props.editing ? (
            <td
              style={{
                ...lessonEditorTableStyles.actionsCell,
                ...styles.actionButtons
              }}
            >
              <div
                style={styles.save}
                onMouseDown={() => this.props.onSave(this.state.description)}
              >
                <i className="fa fa-check" />
              </div>
              <div
                style={styles.remove}
                className="unit-test-cancel-edit"
                onMouseDown={this.handleCancelClick}
              >
                <i className="fa fa-times" />
              </div>
            </td>
          ) : (
            <td
              style={{
                ...lessonEditorTableStyles.actionsCell,
                ...styles.actionButtons
              }}
            >
              <div style={styles.edit} onMouseDown={this.props.onEditClick}>
                <i className="fa fa-edit" />
              </div>
              <div
                style={styles.remove}
                className="unit-test-remove-objective"
                onMouseDown={this.props.onRemove}
              >
                <i className="fa fa-trash" />
              </div>
            </td>
          )}
        </tr>
      );
    }
  }
);
