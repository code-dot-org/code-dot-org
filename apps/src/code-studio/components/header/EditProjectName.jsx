/**
 * Component for editing the name of a project.
 */
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import NameFailureDialog from '../NameFailureDialog';
import NameFailureError from '../../NameFailureError';
import {setNameFailure, unsetNameFailure} from '../../projectRedux';
import styles from './project-header.module.scss';
import classNames from 'classnames';

class UnconnectedEditProjectName extends React.Component {
  static propTypes = {
    finishEdit: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired,
    saveProjectName: PropTypes.func.isRequired,

    // Provided by redux
    projectNameFailure: PropTypes.string,
    setNameFailure: PropTypes.func.isRequired,
    unsetNameFailure: PropTypes.func.isRequired,
  };

  state = {
    savingName: false,
  };

  componentDidMount() {
    this.nameChangeInput.focus();

    // Cancel when ESC key is released.
    this.nameChangeInput.addEventListener('keyup', this.onCancel);
  }

  componentWillUnmount() {
    this.nameChangeInput.removeEventListener('keyup', this.onCancel);
  }

  onCancel = event => {
    if (event.code === 'Escape') {
      this.props.finishEdit();
    }
  };

  saveNameChange = () => {
    if (this.state.savingName) {
      return;
    }

    const newName = this.nameChangeInput.value.trim().substr(0, 100);
    if (newName.length === 0) {
      return;
    }

    this.setState({
      savingName: true,
    });

    this.props
      .saveProjectName(newName)
      .then(() => {
        this.setState({
          savingName: false,
        });
        dashboard.header.updateTimestamp();
        this.props.finishEdit();
      })
      .catch(error => {
        if (error instanceof NameFailureError) {
          this.props.setNameFailure(error.nameFailure);
        }
        this.setState({
          savingName: false,
        });
      });
  };

  onSubmit = event => {
    event.preventDefault();
    this.saveNameChange();
  };

  render() {
    // Use an uncontrolled input for the "rename" operation so our UI tests
    // can easily interface with it
    return (
      <>
        <form onSubmit={this.onSubmit} className={styles.buttonWrapper}>
          <div className="project_name_wrapper header_text">
            <input
              type="text"
              className="project_name header_input"
              maxLength="100"
              defaultValue={this.props.projectName}
              ref={input => {
                this.nameChangeInput = input;
              }}
            />
          </div>
          <button
            type="button"
            className={classNames(
              styles.buttonSpacing,
              'project_save',
              'header_button',
              'header_button_light no-mc'
            )}
            onClick={this.saveNameChange}
            disabled={this.state.savingName}
          >
            {i18n.save()}
          </button>
        </form>
        <NameFailureDialog
          flaggedText={this.props.projectNameFailure}
          isOpen={!!this.props.projectNameFailure}
          handleClose={this.props.unsetNameFailure}
        />
      </>
    );
  }
}

export default connect(
  state => ({
    projectNameFailure: state.project.projectNameFailure,
  }),
  {
    setNameFailure,
    unsetNameFailure,
  }
)(UnconnectedEditProjectName);
