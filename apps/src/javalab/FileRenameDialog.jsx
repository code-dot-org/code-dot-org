import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';

const styles = {
  dialog: {
    textAlign: 'left',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    color: 'black'
  },
  button: {
    float: 'right',
    marginTop: 30
  }
};

export default class FileRenameDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    filename: PropTypes.string,
    handleRename: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      filename: props.filename
    };
  }

  static getDerivedStateFromProps(nextProps) {
    return {filename: nextProps.filename};
  }

  render() {
    const {isOpen, handleClose, handleRename} = this.props;
    const {filename} = this.state;
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={handleClose}
        style={styles.dialog}
        useUpdatedStyles
        hideCloseButton
      >
        <div>Rename the file</div>
        <input
          type="text"
          value={filename}
          onChange={event => this.setState({filename: event.target.value})}
        />
        <Button
          style={styles.button}
          text="Rename"
          onClick={() => handleRename(this.state.filename)}
          color={Button.ButtonColor.blue}
        />
        <Button
          style={styles.button}
          text="Cancel"
          onClick={handleClose}
          color={Button.ButtonColor.gray}
        />
      </BaseDialog>
    );
  }
}
