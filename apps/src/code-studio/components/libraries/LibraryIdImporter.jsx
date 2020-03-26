import PropTypes from 'prop-types';
import React from 'react';
import Radium from 'radium';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {
  DEFAULT_MARGIN,
  libraryStyles
} from '@cdo/apps/code-studio/components/libraries/styles';

const styles = {
  linkBox: {
    cursor: 'auto',
    height: '32px',
    marginBottom: 0,
    flex: 1,
    maxWidth: 400
  },
  inputParent: {
    display: 'flex',
    alignItems: 'baseline'
  },
  add: {
    margin: DEFAULT_MARGIN,
    color: color.dark_charcoal,
    borderColor: color.dark_charcoal,
    ':disabled': {
      color: color.light_gray,
      borderColor: color.light_gray,
      backgroundColor: color.lightest_gray
    }
  },
  error: {
    color: color.red,
    textAlign: 'left',
    margin: DEFAULT_MARGIN,
    minHeight: 30,
    whiteSpace: 'pre-wrap',
    lineHeight: 1
  }
};

export class LibraryIdImporter extends React.Component {
  static propTypes = {
    addLibraryById: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    loadLibraryErrored: PropTypes.bool
  };

  state = {
    importLibraryId: '',
    wasClicked: false
  };

  setLibraryToImport = event => {
    this.setState({importLibraryId: event.target.value, wasClicked: false});
  };

  getButtonContent = () => {
    const {wasClicked} = this.state;
    const {isLoading} = this.props;
    if (wasClicked && isLoading) {
      return <FontAwesome icon="spinner" className="fa-spin" />;
    } else {
      return i18n.add();
    }
  };

  render() {
    const {importLibraryId, wasClicked} = this.state;
    const {addLibraryById, loadLibraryErrored} = this.props;
    return (
      <div>
        <h1 style={libraryStyles.header}>{i18n.libraryIdImport()}</h1>
        <div style={styles.inputParent}>
          <input
            style={styles.linkBox}
            type="text"
            value={importLibraryId}
            onChange={this.setLibraryToImport}
          />
          <button
            style={styles.add}
            onClick={() => {
              this.setState({wasClicked: true});
              addLibraryById(importLibraryId);
            }}
            type="button"
            disabled={!importLibraryId}
          >
            {this.getButtonContent()}
          </button>
        </div>
        <div style={styles.error}>
          {wasClicked && loadLibraryErrored && i18n.libraryImportError()}
        </div>
      </div>
    );
  }
}

export default Radium(LibraryIdImporter);
