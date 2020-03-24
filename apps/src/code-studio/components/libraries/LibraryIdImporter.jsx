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
    isLoading: PropTypes.bool
  };

  state = {
    importLibraryId: '',
    wasClicked: false,
    error: null
  };

  componentDidUpdate(prevProps) {
    const {isLoading} = this.props;
    const {wasClicked} = this.state;
    if (wasClicked && prevProps.isLoading && !isLoading) {
      this.setState({wasClicked: false, error: i18n.libraryImportError()});
    }
  }

  setLibraryToImport = event => {
    this.setState({importLibraryId: event.target.value, error: null});
  };

  render() {
    const {importLibraryId, wasClicked} = this.state;
    const {addLibraryById, isLoading} = this.props;
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
            {wasClicked && isLoading && (
              <FontAwesome icon="spinner" className="fa-spin" />
            )}
            {!(wasClicked && isLoading) && i18n.add()}
          </button>
        </div>
        <div style={styles.error}>{this.state.error}</div>
      </div>
    );
  }
}

export default Radium(LibraryIdImporter);
