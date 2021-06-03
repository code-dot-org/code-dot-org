import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import {CompileStatus} from './constants';
import StylizedBaseDialog from '@cdo/apps/templates/StylizedBaseDialog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export default class CommitDialog extends React.Component {
  state = {
    filesToCommit: [],
    commitNotes: null
  };

  renderFooter = buttons => {
    let compileStatusContent = '';
    switch (this.props.compileStatus) {
      case CompileStatus.LOADING:
        compileStatusContent = i18n.compiling();
        break;
      case CompileStatus.SUCCESS:
        compileStatusContent = [
          <FontAwesome
            key="icon"
            icon="check-circle"
            className="fa-2x"
            style={styles.iconSuccess}
          />,
          <span key="text">{i18n.allFilesCompile()}</span>
        ];
        break;
      case CompileStatus.ERROR:
        compileStatusContent = i18n.compileFailed();
        break;
    }

    return [
      <div
        key="compile-status"
        style={{...styles.bold, ...styles.compileStatus}}
      >
        {compileStatusContent}
      </div>,
      <div key="buttons">{buttons}</div>
    ];
  };

  toggleFileToCommit = filename => {
    let filesToCommit = [...this.state.filesToCommit];
    const fileIdx = filesToCommit.findIndex(name => name === filename);
    if (fileIdx === -1) {
      filesToCommit.push(filename);
    } else {
      filesToCommit.splice(fileIdx, 1);
    }

    this.setState({filesToCommit});
  };

  render() {
    const {filesToCommit, commitNotes} = this.state;
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
              commit: filesToCommit.includes(name)
            }))}
            notes={commitNotes}
            onToggleFile={this.toggleFileToCommit}
            onChangeNotes={commitNotes => this.setState({commitNotes})}
          />
        }
        renderFooter={this.renderFooter}
        handleConfirmation={() => handleCommit(filesToCommit, commitNotes)}
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
      <div style={{...styles.bold, ...styles.filesHeader}}>
        {i18n.includeFiles()}
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
    flexGrow: 2
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
