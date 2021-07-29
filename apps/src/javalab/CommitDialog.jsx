import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import {CompileStatus} from './constants';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';

export default class CommitDialog extends React.Component {
  state = {
    filesToBackpack: [],
    commitNotes: null,
    showCompileStatus: false
  };

  renderFooter = () => {
    let compileStatusContent = '';
    let commitText = i18n.commit();
    const isCommitButtonDisabled = !this.state.commitNotes;
    if (this.state.filesToBackpack.length > 0) {
      commitText = i18n.commitAndSave();
    }
    if (this.state.showCompileStatus) {
      switch (this.props.compileStatus) {
        case CompileStatus.LOADING:
          compileStatusContent = i18n.compiling();
          break;
        case CompileStatus.ERROR:
          compileStatusContent = i18n.compileFailed();
          break;
      }
    }

    return [
      <div
        key="compile-status"
        style={{...styles.bold, ...styles.compileStatus}}
      >
        {compileStatusContent}
      </div>,
      <div key="buttons">
        <FooterButton
          key="cancel"
          type="cancel"
          text={i18n.cancel()}
          onClick={this.props.handleClose}
        />
        ,
        <FooterButton
          id="confirmationButton"
          key="confirm"
          text={commitText}
          disabled={isCommitButtonDisabled}
          color="green"
          onClick={this.commitAndSaveToBackpack}
        />
      </div>
    ];
  };

  commitAndSaveToBackpack = () => {
    this.props.handleCommit(this.state.commitNotes);
    this.saveToBackpack();
  };

  // This will communicate with the backpack API
  saveToBackpack = () => {
    // do something here to save the files in this.state.filesToBackpack
    // show the error message if the files don't compile
    if (this.props.compileStatus !== CompileStatus.SUCCESS) {
      this.setState({showCompileStatus: true});
    } else {
      this.props.handleClose();
    }
  };

  toggleFileToBackpack = filename => {
    let filesToBackpack = [...this.state.filesToBackpack];
    const fileIdx = filesToBackpack.indexOf(filename);
    if (fileIdx === -1) {
      filesToBackpack.push(filename);
    } else {
      filesToBackpack.splice(fileIdx, 1);
    }

    this.setState({filesToBackpack});
  };

  render() {
    const {commitNotes, filesToBackpack} = this.state;
    const {isOpen, files, handleClose, handleCommit} = this.props;

    return (
      <StylizedBaseDialog
        isOpen={isOpen}
        title={i18n.commitCode()}
        confirmationButtonText={i18n.commit()}
        body={
          <CommitDialogBody
            files={files.map(name => ({
              name,
              commit: filesToBackpack.includes(name)
            }))}
            notes={commitNotes}
            onToggleFile={this.toggleFileToBackpack}
            onChangeNotes={commitNotes => this.setState({commitNotes})}
          />
        }
        renderFooter={this.renderFooter}
        handleConfirmation={() => handleCommit(commitNotes)}
        handleClose={handleClose}
        footerJustification="space-between"
      />
    );
  }
}

CommitDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleClose: PropTypes.func.isRequired,
  handleCommit: PropTypes.func.isRequired,
  compileStatus: PropTypes.string
};

CommitDialog.defaultProps = {
  compileStatus: CompileStatus.NONE
};

function CommitDialogBody({files, notes, onToggleFile, onChangeNotes}) {
  return (
    <div>
      <label htmlFor="commit-notes" style={{...styles.bold, ...styles.notes}}>
        {i18n.commitNotes()}
      </label>
      <textarea
        id="commit-notes"
        placeholder={i18n.commitNotesPlaceholder()}
        onChange={e => onChangeNotes(e.target.value)}
        style={styles.textarea}
      >
        {notes}
      </textarea>
      <div style={{...styles.bold, ...styles.filesHeader}}>
        {i18n.saveToBackpack()}
      </div>
      {files.map(file => (
        <div key={file.name} style={styles.fileRow}>
          <label htmlFor={`commit-${file.name}`} style={styles.fileLabel}>
            {file.name}
          </label>
          <input
            id={`commit-${file.name}`}
            type="checkbox"
            checked={file.commit}
            onChange={() => onToggleFile(file.name)}
            style={styles.checkbox}
          />
        </div>
      ))}
    </div>
  );
}

CommitDialogBody.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      commit: PropTypes.bool.isRequired
    })
  ).isRequired,
  notes: PropTypes.string,
  onToggleFile: PropTypes.func.isRequired,
  onChangeNotes: PropTypes.func.isRequired
};

const PADDING = 8;
const styles = {
  bold: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.dark_charcoal
  },
  compileStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  iconSuccess: {
    color: color.level_perfect,
    marginRight: 5
  },
  filesHeader: {
    fontSize: 14,
    backgroundColor: color.lightest_gray,
    padding: PADDING
  },
  fileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: PADDING,
    paddingBottom: PADDING / 2,
    borderBottom: `1px solid ${color.lightest_gray}`
  },
  fileLabel: {
    flexGrow: 2,
    color: color.default_text
  },
  checkbox: {
    width: 18,
    height: 18
  },
  notes: {
    paddingTop: PADDING * 2
  },
  textarea: {
    width: '98%',
    height: 75,
    resize: 'none'
  }
};
